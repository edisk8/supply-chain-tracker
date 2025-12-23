// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {

    enum UserStatus { Pending, Approved, Rejected, Canceled }
    enum TransferStatus { Pending, Accepted, Rejected }

    // Structs
    struct Token {
        uint256 id;
        address creator;
        string name;
        uint256 totalSupply;
        string features; // JSON string
        uint256 parentId;
        uint256 dateCreated;
        // Mapping cannot be returned in public calls, so we access it via functions
        mapping(address => uint256) balance; 
    }

    // Helper struct to return Token data without the mapping
    struct TokenInfo {
        uint256 id;
        address creator;
        string name;
        uint256 totalSupply;
        string features;
        uint256 parentId;
        uint256 dateCreated;
    }

    struct Transfer {
        uint256 id;
        address from;
        address to;
        uint256 tokenId;
        uint256 dateCreated;
        uint256 amount;
        TransferStatus status;
    }

    struct User {
        uint256 id;
        address userAddress;
        string role;
        UserStatus status;
    }

    address public admin;

    // Contadores
    uint256 public nextTokenId = 1;
    uint256 public nextTransferId = 1;
    uint256 public nextUserId = 1;

    // Mappings
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(uint256 => User) public users;
    mapping(address => uint256) public addressToUserId;

    // Auxiliary mappings for performance (to avoid iterating in loops)
    mapping(address => uint256[]) private _userTokens; 
    mapping(address => uint256[]) private _userTransfers;

    // Eventos
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply);
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount);
    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, UserStatus status);

    constructor() {
        admin = msg.sender;
    }

    // Modifiers for security
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegistered() {
        uint256 userId = addressToUserId[msg.sender];
        require(userId != 0, "User not registered");
        require(users[userId].status == UserStatus.Approved, "User not approved");
        _;
    }

    // ⚠️ TU TAREA: Programar estas funciones principales

    // ===========================
    // Gestión de Usuarios
    // ===========================

    function requestUserRole(string memory role) public {
        require(addressToUserId[msg.sender] == 0, "User already registered");
        require(
            keccak256(bytes(role)) == keccak256(bytes("Producer")) ||
            keccak256(bytes(role)) == keccak256(bytes("Factory")) ||
            keccak256(bytes(role)) == keccak256(bytes("Retailer")) ||
            keccak256(bytes(role)) == keccak256(bytes("Consumer")),
            "Invalid role"
        );

        uint256 newId = nextUserId++;
        
        users[newId] = User({
            id: newId,
            userAddress: msg.sender,
            role: role,
            status: UserStatus.Pending
        });

        addressToUserId[msg.sender] = newId;

        emit UserRoleRequested(msg.sender, role);
    }

    function changeStatusUser(address userAddress, UserStatus newStatus) public onlyAdmin {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");

        users[userId].status = newStatus;
        emit UserStatusChanged(userAddress, newStatus);
    }

    function getUserInfo(address userAddress) public view returns (User memory) {
        uint256 userId = addressToUserId[userAddress];
        require(userId != 0, "User not found");
        return users[userId];
    }

    function isAdmin(address userAddress) public view returns (bool) {
        return userAddress == admin;
    }

    // ===========================
    // Gestión de Tokens
    // ===========================

    function createToken(string memory name, uint totalSupply, string memory features, uint parentId) public onlyRegistered {
        // Role check: Only Producer or Factory can create tokens
        User memory currentUser = users[addressToUserId[msg.sender]];
        bool isProducer = keccak256(bytes(currentUser.role)) == keccak256(bytes("Producer"));
        bool isFactory = keccak256(bytes(currentUser.role)) == keccak256(bytes("Factory"));
        
        require(isProducer || isFactory, "Only Producer or Factory can create tokens");

        uint256 newTokenId = nextTokenId++;

        // Initialize Token in storage (cannot do inline struct due to mapping)
        Token storage newToken = tokens[newTokenId];
        newToken.id = newTokenId;
        newToken.creator = msg.sender;
        newToken.name = name;
        newToken.totalSupply = totalSupply;
        newToken.features = features;
        newToken.parentId = parentId;
        newToken.dateCreated = block.timestamp;
        
        // Assign initial balance to creator
        newToken.balance[msg.sender] = totalSupply;

        // Track user tokens for helper function
        _userTokens[msg.sender].push(newTokenId);

        emit TokenCreated(newTokenId, msg.sender, name, totalSupply);
    }

    // Modified to return TokenInfo instead of Token (due to mapping limitation)
    function getToken(uint tokenId) public view returns (TokenInfo memory) {
        Token storage t = tokens[tokenId];
        require(t.id != 0, "Token does not exist");
        
        return TokenInfo({
            id: t.id,
            creator: t.creator,
            name: t.name,
            totalSupply: t.totalSupply,
            features: t.features,
            parentId: t.parentId,
            dateCreated: t.dateCreated
        });
    }

    function getTokenBalance(uint tokenId, address userAddress) public view returns (uint) {
        return tokens[tokenId].balance[userAddress];
    }

    // ===========================
    // Gestión de Transferencias
    // ===========================

    function transfer(address to, uint tokenId, uint amount) public onlyRegistered {
        require(to != address(0), "Invalid address");
        require(tokens[tokenId].balance[msg.sender] >= amount, "Insufficient balance");

        // Escrow logic: Deduct balance immediately to prevent double spending
        tokens[tokenId].balance[msg.sender] -= amount;

        uint256 newTransferId = nextTransferId++;

        transfers[newTransferId] = Transfer({
            id: newTransferId,
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            dateCreated: block.timestamp,
            amount: amount,
            status: TransferStatus.Pending
        });

        // Track transfers for both parties
        _userTransfers[msg.sender].push(newTransferId);
        _userTransfers[to].push(newTransferId);

        emit TransferRequested(newTransferId, msg.sender, to, tokenId, amount);
    }

    function acceptTransfer(uint transferId) public onlyRegistered {
        Transfer storage t = transfers[transferId];
        require(msg.sender == t.to, "Only recipient can accept");
        require(t.status == TransferStatus.Pending, "Transfer not pending");

        t.status = TransferStatus.Accepted;
        
        // Add balance to recipient
        tokens[t.tokenId].balance[msg.sender] += t.amount;

        // Also track token ownership for recipient if it's new to them
        bool alreadyHasToken = false;
        uint256[] memory myTokens = _userTokens[msg.sender];
        for(uint i=0; i<myTokens.length; i++) {
            if(myTokens[i] == t.tokenId) {
                alreadyHasToken = true;
                break;
            }
        }
        if(!alreadyHasToken) {
            _userTokens[msg.sender].push(t.tokenId);
        }

        emit TransferAccepted(transferId);
    }

    function rejectTransfer(uint transferId) public onlyRegistered {
        Transfer storage t = transfers[transferId];
        // Allow recipient to reject, or sender to cancel if still pending
        require(msg.sender == t.to || msg.sender == t.from, "Not authorized");
        require(t.status == TransferStatus.Pending, "Transfer not pending");

        t.status = TransferStatus.Rejected;

        // Refund the sender
        tokens[t.tokenId].balance[t.from] += t.amount;

        emit TransferRejected(transferId);
    }

    function getTransfer(uint transferId) public view returns (Transfer memory) {
        return transfers[transferId];
    }

    // ===========================
    // Funciones auxiliares
    // ===========================

    function getUserTokens(address userAddress) public view returns (uint[] memory) {
        // Returns the list of Token IDs the user has interacted with/created/owned
        return _userTokens[userAddress];
    }

    function getUserTransfers(address userAddress) public view returns (uint[] memory) {
        // Returns list of Transfer IDs where user is sender or receiver
        return _userTransfers[userAddress];
    }
}