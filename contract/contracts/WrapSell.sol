// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// If you have OpenZeppelin installed locally via npm, use this path:
import "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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
// Lista de direcciones autorizadas para agregar cartas
contract Wrapsell is IStablecoin {
    using SafeERC20 for IStablecoin;

    // Only owner modifier moved inside the contract
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Modificación: require mínimo 4 cartas para crear la pool
    modifier requireMinCards(Card[] memory _cards) {
        require(_cards.length >= 4, "At least 4 cards required to create the pool");
        _;
    }
    // Permite al owner autorizar o desautorizar direcciones para agregar cartas
    function setAllowedToAddCards(address account, bool allowed) external {
        require(msg.sender == owner, "Only owner can set allowed addresses");
        allowedToAddCards[account] = allowed;
    }

    function addCard(
        string memory cardName,
        string memory number,
        string memory edition,
        uint256 price,
        string memory url
    ) external onlyOwner {
        cards.push(Card(cardName, number, edition, price, url));
        // Actualizar el máximo minteable si se desea que refleje el nuevo valor total
        maxMintable += price / 4;
    }

    // Permite al owner eliminar una carta por índice, pero no si quedan solo 4 cartas
    function removeCard(uint256 index) external onlyOwner requireMinCards {
        require(index < cards.length, "Card does not exist");
        maxMintable -= cards[index].price / 4;
        cards[index] = cards[cards.length - 1];
        cards.pop();
    }

    // Permite al owner autorizar o desautorizar direcciones para agregar cartas
    mapping(address => bool) public allowedToAddCards;
    function setAllowedToAddCards(address account, bool allowed) external onlyOwner {
        allowedToAddCards[account] = allowed;
    }

    function addCard(
        string memory cardName,
        string memory number,
        string memory edition,
        uint256 price,
        string memory url
    ) external onlyOwner {
        cards.push(Card(cardName, number, edition, price, url));
        // Actualizar el máximo minteable si se desea que refleje el nuevo valor total
        maxMintable += price / 4;
    }
    IStablecoin public stablecoin;
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

    function deposit(uint256 amount) external {
        SafeERC20.safeTransferFrom(IERC20(address(stablecoin)), msg.sender, address(this), amount);
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
