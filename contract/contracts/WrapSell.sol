// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IStablecoin {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

// Estructura para la información de cada carta
struct Card {
    string name;
    string number;
    string edition;
    uint256 price;
    string url;
}

contract Wrapsell is IStablecoin {
    IStablecoin public stablecoin;

    mapping(address => uint256) public balances;

    // Variables solicitadas
    address public owner;
    uint256 public feePercent;
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    // Colección de cartas
    Card[] public cards;

    // Máximo minteable
    uint256 public maxMintable;

    // Stablecoin variables
    string public name = "WrapSell Stablecoin";
    string public symbol = "WSS";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) private _stableBalances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        address _stablecoin,
        Card[] memory _cards
    ) {
        stablecoin = IStablecoin(_stablecoin);
        owner = msg.sender;
        feePercent = 0;
        totalDeposited = 0;
        totalWithdrawn = 0;

        uint256 totalValue = 0;
        // Copiar las cartas a la colección y calcular el valor total
        for (uint256 i = 0; i < _cards.length; i++) {
            cards.push(_cards[i]);
            totalValue += _cards[i].price;
        }
        // El máximo minteable es 1/4 del valor total de las cartas
        maxMintable = totalValue / 4;
    }

    // --- Stablecoin functions ---

    function balanceOf(address account) public view override returns (uint256) {
        return _stableBalances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, currentAllowance - amount);
        return true;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        require(totalSupply + amount <= maxMintable, "Exceeds max mintable");
        totalSupply += amount;
        _stableBalances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public {
        require(_stableBalances[msg.sender] >= amount, "Insufficient balance");
        totalSupply -= amount;
        _stableBalances[msg.sender] -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0) && to != address(0), "Zero address");
        require(_stableBalances[from] >= amount, "Insufficient balance");
        _stableBalances[from] -= amount;
        _stableBalances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0) && spender != address(0), "Zero address");
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }

    // --- WrapSell functions ---

    function deposit(uint256 amount) external {
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        totalDeposited += amount;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        require(stablecoin.transfer(msg.sender, amount), "Transfer failed");
        totalWithdrawn += amount;
    }

    // Obtener el número total de cartas en la colección
    function getCardsCount() external view returns (uint256) {
        return cards.length;
    }

    // Obtener información de una carta específica
    function getCard(uint256 index) external view returns (
        string memory cardName,
        string memory number,
        string memory edition,
        uint256 price,
        string memory url
    ) {
        require(index < cards.length, "Card does not exist");
        Card storage card = cards[index];
        return (card.name, card.number, card.edition, card.price, card.url);
    }
}
