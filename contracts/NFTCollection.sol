// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTCollection is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;

    uint256 public mintPrice;
    uint256 public maxSupply;
    string private _baseTokenURI;
    bool public mintingEnabled = true;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintPriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event MintingToggled(bool enabled);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _mintPrice,
        uint256 _maxSupply,
        string memory _initialBaseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
        _baseTokenURI = _initialBaseURI;
    }

    modifier mintingAllowed() {
        require(mintingEnabled, "Minting is currently disabled");
        _;
    }

    modifier supplyAvailable() {
        require(_nextTokenId <= maxSupply, "Max supply reached");
        _;
    }

    function mint(address to, string memory tokenURI)
        public
        payable
        nonReentrant
        mintingAllowed
        supplyAvailable
    {
        require(msg.value >= mintPrice, "Insufficient payment");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(to, tokenId, tokenURI);
    }

    function batchMint(
        address[] memory recipients,
        string[] memory tokenURIs
    )
        public
        payable
        nonReentrant
        mintingAllowed
    {
        require(recipients.length == tokenURIs.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        require(msg.value >= mintPrice * recipients.length, "Insufficient payment");
        require(_nextTokenId + recipients.length - 1 <= maxSupply, "Would exceed max supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;

            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);

            emit NFTMinted(recipients[i], tokenId, tokenURIs[i]);
        }
    }

    function ownerMint(address to, string memory tokenURI)
        public
        onlyOwner
        supplyAvailable
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(to, tokenId, tokenURI);
    }

    function setMintPrice(uint256 _newPrice) public onlyOwner {
        mintPrice = _newPrice;
        emit MintPriceUpdated(_newPrice);
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        _baseTokenURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}