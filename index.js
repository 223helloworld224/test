const express = require('express');
const bodyParser = require('body-parser')
const { ethers } = require("ethers");
const handlebars = require('express-handlebars')
const { LocalStorage } = require("node-localstorage")

const app = express();



const localStorage = new LocalStorage('./scratch');


app.use(bodyParser.urlencoded({ extended: true }))



app.engine('handlebars', handlebars.engine());


app.set('view engine', 'handlebars');
app.set('views', './views');


const url = 'https://ropsten.infura.io/v3/0265dc3c07084c868f93aaa470bb44a4';
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

let wallet;



app.get('/', (req, res) => {
    localStorage.setItem('last_transaction', 'false')
    const { phrase } = ethers.Wallet.createRandom().mnemonic;
    res.render('home', { phrase });
});


app.post('/generate', async (req, res) => {
    const { phrase } = req.body;

    const walletMnemonic = ethers.Wallet.fromMnemonic(phrase)

    wallet = walletMnemonic.connect(customHttpProvider)

    const address = walletMnemonic.address;
    const balance = await getBalance(address)


    localStorage.setItem('last_transaction', 'false')


    res.render('address', { address, balance });
})


app.post('/send', async (req, res) => {

    if (localStorage.getItem('last_transaction') == 'true') {
        localStorage.setItem('last_transaction', 'false')
        res.redirect('/');
    }


    const { address, amount } = req.body;

    let tx = {
        to: address,
        value: ethers.utils.parseEther(amount)
    }

    const result = await wallet.sendTransaction(tx);

    if (result) {
        localStorage.setItem('last_transaction', 'true')
    }

    res.render('result', { result })

})


async function getBalance(addr) {
    const bal = await customHttpProvider.getBalance(addr)
    return ethers.utils.formatEther(bal)
}

app.listen(3000, function () {
    console.log('listening on 3000')
})


