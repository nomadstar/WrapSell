// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WrapSell {
    // ERC20 Basic Variables
    string public constant name = "WrapSell Stablecoin";
    string public constant symbol = "WSC";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    // Owner and permissions
    address public owner;
    
    // Balances and allowances
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Deposit/withdrawal tracking
    mapping(address => uint256) public depositBalances;
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    
    // Fee system
    uint256 public feePercent;
    
    // Pool management
    address[] public pools;
    mapping(address => bool) public isPool;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event PoolAdded(address indexed pool);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        feePercent = 0;
        totalDeposited = 0;
        totalWithdrawn = 0;
    }

    // --- Pool Management Functions ---
    
    function addPool(address poolAddress) external onlyOwner {
        require(poolAddress != address(0), "Invalid pool address");
        require(!isPool[poolAddress], "Pool already exists");
        
        pools.push(poolAddress);
        isPool[poolAddress] = true;
        
        emit PoolAdded(poolAddress);
    }
    
    function getPoolCount() external view returns (uint256) {
        return pools.length;
    }
    
    function getPool(uint256 index) external view returns (address) {
        require(index < pools.length, "Pool index out of bounds");
        return pools[index];
    }

    // --- ERC20 Functions ---

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        
        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);
        
        return true;
    }

    // --- Stablecoin Specific Functions ---

    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "ERC20: mint to the zero address");
        
        totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public {
        require(_balances[msg.sender] >= amount, "ERC20: burn amount exceeds balance");
        
        totalSupply -= amount;
        _balances[msg.sender] -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
    }

    function deposit(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= amount, "Insufficient ETH sent");
        
        // Mint 1:1 ratio of stablecoins
        totalSupply += amount;
        _balances[msg.sender] += amount;
        depositBalances[msg.sender] += amount;
        totalDeposited += amount;
        
        emit Transfer(address(0), msg.sender, amount);
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        require(depositBalances[msg.sender] >= amount, "Insufficient deposit balance");
        
        // Burn the stablecoins
        totalSupply -= amount;
        _balances[msg.sender] -= amount;
        depositBalances[msg.sender] -= amount;
        totalWithdrawn += amount;
        
        // Transfer ETH back
        payable(msg.sender).transfer(amount);
        
        emit Transfer(msg.sender, address(0), amount);
        emit Withdrawal(msg.sender, amount);
    }

    // --- Internal Functions ---

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(_balances[from] >= amount, "ERC20: transfer amount exceeds balance");

        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }

    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }

    // --- Admin Functions ---

    function setFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        feePercent = newFeePercent;
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        payable(owner).transfer(amount);
    }

    // --- View Functions ---

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserDepositBalance(address user) external view returns (uint256) {
        return depositBalances[user];
    }
}
