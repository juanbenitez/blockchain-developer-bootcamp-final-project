App = {
    web3Provider: null,
    currentAccount: null,
    currentChainId: null,
    contracts: {},
    
    init: async () => {
      await App.loadWeb3();
      await App.render();
      await App.renderMinted();
    },

    loadWeb3: async () => {
      if (typeof window.ethereum !== 'undefined') {
        App.web3Provider = window.ethereum;

        // Metamask is installed
        document.getElementById("connectEthButton").disabled = false;
        console.info("Metamask wallet is installed.");

        //check chain connected
        App.currentChainId = await ethereum.request({ method: 'eth_chainId' });
        console.info("Connected to chain " + App.currentChainId);
        
        //connected to mainnet
        if(App.currentChainId == '0x1'){
          console.error('DANGER! you are not in a testnet.');
          document.getElementById("connectEthButton").disabled = true;
          document.querySelector('.showAccount').innerHTML = '';
          App.showMessage("DANGER! you are not in a testnet");
        }

        //instanciate Web3
        web3 = new Web3(App.web3Provider);
        App.loadAccount();

      } else {
        console.error("No ethereum wallet is installed. Please install MetaMask ");
        document.getElementById("connectEthButton").disabled = true;
        //alert("No ethereum wallet is installed. Please install MetaMask");
        App.showMessage("No ethereum wallet is installed. Please install MetaMask");
      }

      return App.loadContract();
    },
    
    loadAccount: async () => {
      const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
      App.currentAccount = accounts[0];
      const showAccount = document.querySelector('.showAccount');
      showAccount.innerHTML = App.currentAccount;
      console.info('Current acc: '+App.currentAccount);
    },

   loadContract: async () => {
      try {
        const res = await fetch("Certification.json");
        const certificationJSON = await res.json();
        App.contracts.CertificationContract = TruffleContract(certificationJSON);
        App.contracts.CertificationContract.setProvider(App.web3Provider);
        App.contracts.CertificationContract.setNetwork(App.currentChainId);
  
        App.instanceCertification = await App.contracts.CertificationContract.deployed();
      } catch (error) {
        App.showError(error);
      }
    },

    render: async () => {
      let arrCertificates = await App.instanceCertification.getCertificates();
      console.log(arrCertificates);
      let htmlOutput = '';

      for (let i = 0; i < arrCertificates.length; i++) {
        let certId         = arrCertificates[i].id;
        let certTitle      = arrCertificates[i].title;
        let certIssuedBy   = arrCertificates[i].issuedBy;
        let certIssuedDate = arrCertificates[i].issuedDate;
        let certStatus     = arrCertificates[i].status;
        let certValidDays  = arrCertificates[i].validDays;

        let certificateHtmlElement = 
          `<div class="card bg-dark rounded-0 mb-2">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h3>${certTitle}</h3>
              <div class="form-check form-switch">
               
                <span class="badge rounded-pill bg-secondary 
                ${certStatus == '0' ? "d-inline" : "d-none"} ">Draft</span>
                <span class="badge rounded-pill bg-success 
                ${certStatus == '1' ? "d-inline" : "d-none"} ">Published</span>
                <span class="badge rounded-pill bg-danger 
                ${certStatus == '2' ? "d-inline" : "d-none"} ">Closed</span>
                <!-- input class="form-check-input" data-id="${certId}" type="checkbox" onchange="App.toggleDone(this)" 
                ${
                  certStatus === true && "checked"
                } -->
              </div>
            </div>
            <!-- img src="./images/certificate.svg" class="card-img-top"  alt="" -->
            <div class="card-body">
              <span class="d-block fs-6">Id: ${certId.toString()}</span>
              <span class="d-block">Tutor: ${certIssuedBy}</span>
              <span class="d-block">Valid for ${certValidDays} days</span>
              <p class="text-muted pt-2">Certificate was created ${new Date(
                certIssuedDate * 1000
              ).toLocaleString()}</p>
              </label>
            </div>
            <div class="card-footer">
              <input id="" type="hidden" value="${certId}" />
              <a id="" href="#" class="btn btn-primary" onclick="App.mintCertificate('${certId}')">Mint</a>
            </div>
          </div>`;
          htmlOutput += certificateHtmlElement;
      }
      
      document.querySelector("#certList").innerHTML = htmlOutput;
    },

    renderMinted: async () => {
      const {0: arrCertificates, 1: tokens} = await App.instanceCertification.getCertificatesByHolder(App.currentAccount);
      let chain = web3.utils.hexToNumber(App.currentChainId);
      let contractAddress = App.contracts.CertificationContract.networks[chain].address;
      console.log(chain);
      console.log(App.contracts.CertificationContract.networks[chain].address);
      
      let htmlOutput = '';

      for (let i = 0; i < arrCertificates.length; i++) {
        let certTitle = arrCertificates[i].title;
        let tokenId   = tokens[i].toString();
       
        let certificateHtmlElement = 
          `<div class="d-flex ms-2">
            <span class="material-icons mx-2"> drag_handle </span>
            <span>
               <a href="https://testnets.opensea.io/assets/${contractAddress}/${tokenId}/" target="_blank" >
                 ${certTitle}
               </a>
            </span></div>`;
          htmlOutput += certificateHtmlElement;
      }
      
      document.querySelector("#my-certificates").innerHTML = htmlOutput;
    },

    createCertification: async (title, validDays) => {
      try {
        const result = await App.instanceCertification.createCertificate(title, App.currentAccount, validDays, {from:App.currentAccount});
        console.log("y aca");
        console.log(result.logs[0].args);
        window.location.reload();
      } catch (error) {
        App.showError(error);
      }
    },

    setStatusCertification: async (certificateId, status) => {
      let result = null;
      console.log(certificateId, status);
      try {

        if(status == 1){ //publish
          result = await App.instanceCertification.publishCertificate(certificateId, {from:App.currentAccount});
        }else{ //close
          result = await App.instanceCertification.closeCertificate(certificateId, {from:App.currentAccount});
        }
        console.log(result.logs[0].args);
        window.location.reload();
      } catch (error) {
        App.showError(error);
      }
    },

    mintCertificate: async (certificateId) => {
      try {
        const result = await App.instanceCertification.mintCertificateNFT(certificateId, {from:App.currentAccount});
        console.log(result.logs[0].args);
             
        App.showSuccess("Certificate was minted! token ID: " + result.logs[0].args.tokenId.toString());
        App.renderMinted();
      } catch (error) {
        App.showError(error);
      } 
      console.log("certid:" + certificateId);
    },

    showError: async (error) => {
        let element = document.getElementById("errorToast");
        let myToast = new bootstrap.Toast(element);
        document.querySelector("#error-toast-text").innerHTML = error.message;
        myToast.show();
        console.log("log error:");
        console.log(error.message);
    },
    showSuccess: async (message) => {
        App.showMessage(message, 'success');
    },
    showInfo: async (message) => {
        App.showMessage(message, 'info');
    },
    showMessage: async (message, type) => {
        toastIdElem = type + "Toast";
        toastTextElem = "#" + type + "-toast-text";
        let element = document.getElementById(toastIdElem);
        let myToast = new bootstrap.Toast(element);
        document.querySelector(toastTextElem).innerHTML = message;
        myToast.show();
        console.log("log message:");
        console.log(message);
    },
  };