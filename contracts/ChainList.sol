//spdx-license-identifier: MIT

pragma solidity >0.4.99 <0.6.0;

contract ChainList {
    address seller;
    string name;
    string description;
    uint256 price;

    //sell and atricle
    function sellArticle(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public {
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;
    }

    //get an article
    function getArticle()
        public
        view
        returns (
            address _seller,
            string memory _name,
            string memory _description,
            uint256 _price
        )
    {
        return (seller, name, description, price);
    }
}
