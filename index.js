require('chromedriver')
const webdriver =  require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const Promise = require('promise')
const fs = require('fs')
const config = require('./config')
// const proxy = require('./proxy')

// let proxyAddress = '52.30.92.45:8086'
// proxy.getNewProxy()
let opts
if(config.show_browser) {
    opts = new chrome.Options()
}else{
    opts = new chrome.Options().headless()
    // .addArguments(`--proxy-server=http://${proxyAddress}`)
}

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(opts)
    .build()

fs.readFile('./wordlist.txt', {encoding: 'utf-8'}, async (err,data)=>{
    if(data == ''){
        console.log('Wordlist is empty. Add your word into wordlist')
        process.exit(1)
    }
})

let checking_domain = async (domain)=>{
    let is_search_form_exist = true
    let inputSearchElement = webdriver.By.xpath("//input[@name='searchTerm']")
    let resultElement = webdriver.By.xpath("//div[@class='domain-name']/span")
    await driver.findElements(inputSearchElement)
    await driver.wait(webdriver.until.elementLocated(inputSearchElement))
    await driver.findElement(inputSearchElement).clear()
    await driver.findElement(inputSearchElement).sendKeys(domain)
    await driver.findElement(webdriver.By.xpath("//button[@data-eid='find.sales.search_bar.search.click']")).click()
    await driver.wait(webdriver.until.elementLocated(resultElement))
    let txtRes = await driver.findElement(webdriver.By.xpath("//div[@class='domain-name']/span")).getText()
    return await ((txt)=>{
        res_check = txt.split(' ')
        result_str = res_check.slice(1).join(' ')
        return result_str
    })(txtRes)
}

let start_check = () => {
    fs.writeFile('./available-domain.txt', '', ()=>{
        if (config.show_log) {
            console.log('available domain removed')
        }
    })
    fs.readFile('./wordlist.txt', {encoding: 'utf-8'}, async (err,data)=>{
        if (!err) {
            let arr_domain = data.toString().split("\n")
            let counter = 0
            for(i in arr_domain) {
                for (j in config.tld) {
                    counter++ 
                    if (config.show_log) {
                        console.log('checking : ' + arr_domain[i]+'.'+config.tld[j])
                    }
                    let availability = await checking_domain(arr_domain[i]+'.'+config.tld[j])
                    if (config.show_log) {
                        console.log(availability + '\n')
                    }
                    if(availability == 'tersedia'){
                        fs.appendFileSync('./available-domain.txt', arr_domain[i]+'.'+config.tld[j]+'\n')
                    }
                    if(counter == arr_domain.length*config.tld.length){
                        if (config.show_log) {
                            console.log('Finished. Open file available-domain.txt for result')
                        }
                        (await driver).quit()
                    }  
                }
            }
        } else {
            console.log(err)
        }
    })
}

(async ()=>{
    await driver.get('https://id.godaddy.com/domainsearch/find')
    await start_check()
})()