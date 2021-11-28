document.addEventListener("DOMContentLoaded", () => {
    App.init();

   
    const statusForm = document.querySelector("#statusForm");
    statusForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const certificateId = statusForm["certificateId"].value;
      const status = parseInt(statusForm["status"].value);
      statusForm["certificateId"].value = '';
      statusForm["status"].value = '';
      App.setStatusCertification(certificateId, status);
    });

});
  
//const ethereumButton = document.querySelector('.connectEthButton');
const showAccount = document.querySelector('.showAccount');
const ethereumButton = document.getElementById('connectEthButton');

//showAccount.innerHTML = App.currentAccount;

let currentAccount = null;

ethereumButton.addEventListener('click', () => {
  //Will Start the metamask extension
  getAccount();
  //App.loadAccount();
  console.log('fuear ' + currentAccount);
  showAccount.innerHTML = currentAccount;
  
});

async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = accounts[0];
    console.log(accounts);
    showAccount.innerHTML = currentAccount;
  }

/**
 * 
 */
const certForm = document.querySelector("#certForm");
  
certForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title     = certForm["title"].value;
  const validDays = parseInt(certForm["validDays"].value);
  certForm["title"].value = '';
  certForm["validDays"].value = '';
  App.createCertification(title, validDays);
});


/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

/* ethereum
  .request({ method: 'eth_accounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    // Some unexpected error.
    // For backwards compatibility reasons, if no accounts are available,
    // eth_accounts will return an empty array.
    console.error(err);
  }); */

// Note that this event is emitted on page load.
// If the array of accounts is non-empty, you're already
// connected.
ethereum.on('accountsChanged', handleAccountsChanged);

// For now, 'eth_accounts' will continue to always return an array
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
    alert('Please connect to MetaMask.');
    showAccount.innerHTML = '';
  } else if (accounts[0] !== currentAccount) {
    App.currentAccount = accounts[0];
    showAccount.innerHTML = accounts[0];
    App.showInfo("Account changed!");
    App.renderMinted();
    console.log('Acc changed to: ' + App.currentAccount);
  }
}

ethereum.on('chainChanged', (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    console.log('chain changes:' + chainId);
    if(chainId == '0x1'){
        App.showMessage("DANGER! you are not in a testnet.");
        alert('DANGER! you are not in a testnet.');
        document.getElementById("connectEthButton").disabled = true;
        showAccount.innerHTML = currentAccount;
    }
    window.location.reload();
  });