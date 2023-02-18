let web3Provider;
let contracts = {};
let account = "0x0";

function init() {
  initWeb3();
}

function initWeb3() {
  // initialize web3
  if (typeof web3 !== "undefined") {
    // reuse the provider of the Web3 object injected by Metamask
    web3Provider = web3.currentProvider;
  } else {
    // create a new provider and plug it directly into our local node
    web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
  }
  web3 = new Web3(web3Provider);

  displayAccountInfo();

  initContract();
}

function displayAccountInfo() {
  web3.eth.getCoinbase(function (err, _account) {
    if (err === null) {
      account = _account;
      document.querySelector("#account").innerHTML = account;
      web3.eth.getBalance(account, function (err, balance) {
        if (err === null) {
          document.querySelector("#accountBalance").innerHTML =
            web3.fromWei(balance, "ether") + " ETH";
        }
      });
    }
  });
}

function initContract() {
  fetch("ChainList.json")
    .then((response) => response.json())
    .then((chainListArtifact) => {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      contracts.ChainList = TruffleContract(chainListArtifact);
      // set the provider for our contracts
      contracts.ChainList.setProvider(web3Provider);
      // retrieve the article from the contract
      return reloadArticles();
    })
    .catch((err) => console.error(err));
}

function reloadArticles() {
  // refresh account information because the balance might have changed
  displayAccountInfo();

  // retrieve the article placeholder and clear it
  const articlesRow = document.getElementById("articlesRow");
  articlesRow.innerHTML = "";

  contracts.ChainList.deployed()
    .then(function (instance) {
      return instance.getArticle();
    })
    .then(function (article) {
      if (article[0] == "0x0") {
        // no article
        return;
      }

      // retrieve the article template and fill it
      const articleTemplate = document.getElementById("articleTemplate");
      articleTemplate.querySelector(".panel-title").textContent = article[1];
      articleTemplate.querySelector(".article-description").textContent =
        article[2];
      articleTemplate.querySelector(".article-price").textContent =
        web3.fromWei(article[3], "ether");

      let seller = article[0];
      if (seller == account) {
        seller = "You";
      }
      articleTemplate.querySelector(".article-seller").textContent = seller;

      // add this article
      articlesRow.insertAdjacentHTML("beforeend", articleTemplate.innerHTML);
    })
    .catch(function (err) {
      console.error(err.message);
    });
}

function sellArticle() {
  // retrieve the detail of the article
  const article_name = document.querySelector("#article_name").value;
  const description = document.querySelector("#article_description").value;
  const price = web3.toWei(
    parseFloat(document.querySelector("#article_price").value || 0),
    "ether"
  );

  if (article_name.trim() == "" || price == 0) {
    // nothing to sell
    return false;
  }

  contracts.ChainList.deployed()
    .then((instance) =>
      instance.sellArticle(article_name, description, price, {
        from: account,
        gas: 500000,
      })
    )
    .then((result) => {
      reloadArticles();
    })
    .catch((err) => console.error(err));
}

window.addEventListener("load", init);
