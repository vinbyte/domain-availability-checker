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

driver.get('https://id.godaddy.com/domainsearch/find?checkAvail=1&tmskey=&domainToCheck=')

let checking_domain = (domain)=>{
    let is_search_form_exist = true
    let target = domain
    return driver.findElements(webdriver.By.xpath("//input[@id='o']"))
    .then((elements)=>{
        if(elements.length == 0 ){
            is_search_form_exist = false
        }
    })
    .then(()=>{
        if(is_search_form_exist == false){
            return driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//input[@id='o']")), config.timeout)
        }else{
            return driver.findElement(webdriver.By.xpath("//input[@id='o']")).clear()
        }
    })
    .then(()=>{
        return driver.findElement(webdriver.By.xpath("//input[@id='o']")).sendKeys(target)
    })
    .then(()=>{
        return driver.findElement(webdriver.By.xpath("//button[@data-eid='find.sales.search_bar.search.click']")).click()
    })
    .then(()=>{
        return new Promise((res, rej)=>{
            if (config.show_log){
                console.log('waiting result ...')
            }
            setTimeout(() => {
                res('done')
            }, config.timeout)
        })
        .then(()=>{
            return driver.findElement(webdriver.By.xpath("//div[@class='domain-name']/span")).getText()
        })
        .then((txt)=>{
            res_check = txt.split(' ')
            return res_check[res_check.length-1]
        })
    })
}

setTimeout(async () => {
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
                    if(availability == 'available'){
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
}, config.timeout)

