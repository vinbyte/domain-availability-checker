const axios = require('axios')

exports.getNewProxy = ()=>{
    return new Promise((res,rej)=>{
        axios.get('http://pubproxy.com/api/proxy?country=US&type=http&https=true')
        .then(response => {
            console.log(response.data.data[0].ipPort)
            res(response.data.data[0].ipPort)
        })
        .catch(error => {
            console.log(error);
            rej(error)
        })
    })
}