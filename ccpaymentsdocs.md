CCPayment is a cryptocurrency payment platform allowing merchants to accept and payout over 100 cryptocurrencies with the lowest fees on the market.

**Quick Guide**

**Credentials**

To establish communication with CCPayment systems, you need credentials for your Terminals.

**How to obtain Credentials**

Step1: Go to the registration page of CCPayment and [sign up](https://console.ccpayment.com/register) using your email address.

Step2: Log in and navigate to the **Dashboard \> developer** to obtain your **"APP ID"** and **"APP Secret"**, which will serve as your credentials to communicate with CCPayment.

**API Authentication and Specifications**

You will need "APP ID" and "APP Secret" to sign every message sent to CCPayment.

**Signature**

Prepare a signText by creating a string concatenating appId and timestamp, and append the request payload if present. Example: signText \= {Appid} \+ {timestamp} \+ Payload in JSON format

HMAC: Use SHA-256 hashing algorithm to compute the signature of the request data.

RSA: Use the RSA private key to sign the hashed data(SHA-256) and convert the signature into a Base64-encoded string.

10-digit timestamp  
The payload of the requests must be a JSON object. And the payload you sign should be exactly the same as the payload you send in the request.

**Before signing, here are a few things you should check:**

1\. Ensure the APP ID and App Secret are correct. You can check it on your [dashboard](https://console.ccpayment.com/developer/config). Note: If you use a random APP ID for any unauthorized actions, we will block the IP and APP ID after a number of requests.

2\. Make sure your website has been [verified](https://console.ccpayment.com/merchatsetting/menu/verification/index). Only verified merchant accounts have access to APIs.

3\. If you have set up an IP whitelist on your [dashboard](https://console.ccpayment.com/developer/config), ensure the IP address of your requests is included in your whitelist.

**Request Header**

To ensure the proper handling of your requests by the server, please include the following headers in each request

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| Appid | String | Yes | Your CCPayment APP ID |
| Timestamp | String | Yes | 10-digit timestamp. Valid in 2 minutes. Example: 1677152720 |
| Sign | String | Yes | Check the example on your right hand HMAC Example: 871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6 RSA Example: R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A== |

Headers for all requests made to CCPayment follow the same rule.

HMAC Signature Example

1var sign \= CryptoJS.HmacSHA256('The quick brown fox jumped over the lazy dog.',appSecret).toString();

API usage example  
getCoinList interface (no parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoinList';  
8const args \= '';  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

getCoin interface (need parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoin';  
8const args \= JSON.stringify({ "coinId": 1280 });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

RSA Signature Example

1*// Prepare data to be signed*  
2    const dataToSign \= apiID \+ timestamp \+ apiParams;  
3  
4    *// Load the private key*  
5    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
6  
7    *// Sign the data*  
8    const sign \= crypto.createSign('SHA256');  
9    sign.update(dataToSign);  
10    sign.end();  
11

12    const signature \= sign.sign(privateKey, 'base64');

API usage example  
getCoinList interface (need parameters):

1const crypto \= require('crypto');  
2const https \= require('https');  
3  
4*// Usage example*  
5const apiID \= "\*\*\* your app\_id \*\*\*";  
6const privateKeyPem \= \`-----BEGIN PRIVATE KEY-----  
7\*\*\* your PRIVATE KEY \*\*\*  
8\-----END PRIVATE KEY-----\`  
9const apiParams \= "";  
10const apiPath \= "https://ccpayment.com/ccpayment/v2/getCoinList";  
11  
12(async () \=\> {  
13  try {  
14    const response \= await signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath);  
15    console.log("Response:", response);  
16  } catch (err) {  
17    console.error("Error:", err);  
18  }  
19})();  
20  
21function signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath) {  
22  return new Promise((resolve, reject) \=\> {  
23    *// Calculate the timestamp*  
24    const timestamp \= Math.floor(Date.now() / 1000).toString();  
25  
26    *// Prepare data to be signed*  
27    const dataToSign \= apiID \+ timestamp \+ apiParams;  
28  
29    *// Load the private key*  
30    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
31  
32    *// Sign the data*  
33    const sign \= crypto.createSign('SHA256');  
34    sign.update(dataToSign);  
35    sign.end();  
36  
37    const signature \= sign.sign(privateKey, 'base64');  
38  
39    *// Send the request*  
40    const postData \= apiParams;  
41  
42    const url \= new URL(apiPath);  
43    const options \= {  
44      hostname: url.hostname,  
45      path: url.pathname \+ url.search,  
46      method: 'POST',  
47      headers: {  
48        'Appid': apiID,  
49        'Sign': signature,  
50        'Timestamp': timestamp,  
51        'Content-Type': 'application/x-www-form-urlencoded'  
52      }  
53    };  
54  
55    const req \= https.request(options, (res) \=\> {  
56      let data \= '';  
57  
58      *// Collect response data*  
59      res.on('data', (chunk) \=\> {  
60        data \+= chunk;  
61      });  
62  
63      *// Resolve the response when it ends*  
64      res.on('end', () \=\> {  
65        resolve(data);  
66      });  
67    });  
68  
69    *// Handle request error*  
70    req.on('error', (e) \=\> {  
71      reject(e);  
72    });  
73  
74    *// Write POST data*  
75    req.write(postData);  
76    req.end();  
77  });  
78}

79  
**FAQ**

**Parameter**

The request header must include three parameters: Appid, Timestamp (10-digit timestamp), and Sign.

**Order of the variables is not interchangable**

The correct order is {Appid} \+ {Timestamp} \+ {JASON object}

**Rules for API Calls**

| Rule | Description |
| :---- | :---- |
| Transfer Mode | HTTPS |
| Submit Mode | POST, may vary for different APIs |
| Content-Type | Application/Json |
| Char Encoding | UTF-8 |
| Signature Algorithm | HmacSHA-256 |

**Request Limits**

[Question?](https://t.me/CCPaymentSupportBot)  
payments@fairstakegaming.com  
pay\*\*\*@fairstakegaming.comRole: Owner  
JavaPHPPythonNodeGolang  
**Introduction**

CCPayment is a cryptocurrency payment platform allowing merchants to accept and payout over 100 cryptocurrencies with the lowest fees on the market.

**Quick Guide**

**Credentials**

To establish communication with CCPayment systems, you need credentials for your Terminals.

**How to obtain Credentials**

Step1: Go to the registration page of CCPayment and [sign up](https://console.ccpayment.com/register) using your email address.

Step2: Log in and navigate to the **Dashboard \> developer** to obtain your **"APP ID"** and **"APP Secret"**, which will serve as your credentials to communicate with CCPayment.

**API Authentication and Specifications**

You will need "APP ID" and "APP Secret" to sign every message sent to CCPayment.

**Signature**

Prepare a signText by creating a string concatenating appId and timestamp, and append the request payload if present. Example: signText \= {Appid} \+ {timestamp} \+ Payload in JSON format

HMAC: Use SHA-256 hashing algorithm to compute the signature of the request data.

RSA: Use the RSA private key to sign the hashed data(SHA-256) and convert the signature into a Base64-encoded string.

10-digit timestamp  
The payload of the requests must be a JSON object. And the payload you sign should be exactly the same as the payload you send in the request.

**Before signing, here are a few things you should check:**

1\. Ensure the APP ID and App Secret are correct. You can check it on your [dashboard](https://console.ccpayment.com/developer/config). Note: If you use a random APP ID for any unauthorized actions, we will block the IP and APP ID after a number of requests.

2\. Make sure your website has been [verified](https://console.ccpayment.com/merchatsetting/menu/verification/index). Only verified merchant accounts have access to APIs.

3\. If you have set up an IP whitelist on your [dashboard](https://console.ccpayment.com/developer/config), ensure the IP address of your requests is included in your whitelist.

**Request Header**

To ensure the proper handling of your requests by the server, please include the following headers in each request

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| Appid | String | Yes | Your CCPayment APP ID |
| Timestamp | String | Yes | 10-digit timestamp. Valid in 2 minutes. Example: 1677152720 |
| Sign | String | Yes | Check the example on your right hand HMAC Example: 871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6 RSA Example: R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A== |

Headers for all requests made to CCPayment follow the same rule.

HMAC Signature Example

1var sign \= CryptoJS.HmacSHA256('The quick brown fox jumped over the lazy dog.',appSecret).toString();

API usage example  
getCoinList interface (no parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoinList';  
8const args \= '';  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

getCoin interface (need parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoin';  
8const args \= JSON.stringify({ "coinId": 1280 });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

RSA Signature Example

1*// Prepare data to be signed*  
2    const dataToSign \= apiID \+ timestamp \+ apiParams;  
3  
4    *// Load the private key*  
5    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
6  
7    *// Sign the data*  
8    const sign \= crypto.createSign('SHA256');  
9    sign.update(dataToSign);  
10    sign.end();  
11

12    const signature \= sign.sign(privateKey, 'base64');

API usage example  
getCoinList interface (need parameters):

1const crypto \= require('crypto');  
2const https \= require('https');  
3  
4*// Usage example*  
5const apiID \= "\*\*\* your app\_id \*\*\*";  
6const privateKeyPem \= \`-----BEGIN PRIVATE KEY-----  
7\*\*\* your PRIVATE KEY \*\*\*  
8\-----END PRIVATE KEY-----\`  
9const apiParams \= "";  
10const apiPath \= "https://ccpayment.com/ccpayment/v2/getCoinList";  
11  
12(async () \=\> {  
13  try {  
14    const response \= await signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath);  
15    console.log("Response:", response);  
16  } catch (err) {  
17    console.error("Error:", err);  
18  }  
19})();  
20  
21function signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath) {  
22  return new Promise((resolve, reject) \=\> {  
23    *// Calculate the timestamp*  
24    const timestamp \= Math.floor(Date.now() / 1000).toString();  
25  
26    *// Prepare data to be signed*  
27    const dataToSign \= apiID \+ timestamp \+ apiParams;  
28  
29    *// Load the private key*  
30    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
31  
32    *// Sign the data*  
33    const sign \= crypto.createSign('SHA256');  
34    sign.update(dataToSign);  
35    sign.end();  
36  
37    const signature \= sign.sign(privateKey, 'base64');  
38  
39    *// Send the request*  
40    const postData \= apiParams;  
41  
42    const url \= new URL(apiPath);  
43    const options \= {  
44      hostname: url.hostname,  
45      path: url.pathname \+ url.search,  
46      method: 'POST',  
47      headers: {  
48        'Appid': apiID,  
49        'Sign': signature,  
50        'Timestamp': timestamp,  
51        'Content-Type': 'application/x-www-form-urlencoded'  
52      }  
53    };  
54  
55    const req \= https.request(options, (res) \=\> {  
56      let data \= '';  
57  
58      *// Collect response data*  
59      res.on('data', (chunk) \=\> {  
60        data \+= chunk;  
61      });  
62  
63      *// Resolve the response when it ends*  
64      res.on('end', () \=\> {  
65        resolve(data);  
66      });  
67    });  
68  
69    *// Handle request error*  
70    req.on('error', (e) \=\> {  
71      reject(e);  
72    });  
73  
74    *// Write POST data*  
75    req.write(postData);  
76    req.end();  
77  });  
78}

79  
**FAQ**

**Parameter**

The request header must include three parameters: Appid, Timestamp (10-digit timestamp), and Sign.

**Order of the variables is not interchangable**

The correct order is {Appid} \+ {Timestamp} \+ {JASON object}

**Rules for API Calls**

| Rule | Description |
| :---- | :---- |
| Transfer Mode | HTTPS |
| Submit Mode | POST, may vary for different APIs |
| Content-Type | Application/Json |
| Char Encoding | UTF-8 |
| Signature Algorithm | HmacSHA-256 |

**Request Limits**

Check the specific interface documentation to know the exact information.

"Errorcode": "11004" means you have reached the rate limit.  
To increase the limit, please contact your CCPayment account manager.  
**Quick Guide**

**API Flow Diagram**

You can follow the process below to integrate with CCPayment's payment API. Or you can contact [CCPayment experts](https://t.me/CCPaymentSupportBot) for recommended integration solutions and troubleshooting technical issues.  
**Deposit by Orders**

**![][image1]**

**Deposit by Permanent Addresses**

**![][image2]**

**Withdrawal**

**![][image3]**  
**Testnet**

If you would like to test your integration with test currencies, you can use ETH Sepolia to test the functions. Navigate to **CCPayment dashboard \>** **Merchant Settings \>** **Merchant Settings \>** **ETH test network** and turn the switch on to enable test network.

Get free test Sepolia ETH:  
Faucets are online resources where you can receive free testnet coins.

[https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

[https://sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de/)

[https://www.allthatnode.com/faucet/ethereum.dsrv](https://www.allthatnode.com/faucet/ethereum.dsrv)

[https://faucet.quicknode.com/drip](https://faucet.quicknode.com/drip)

Check the transaction details on blockchain explorer

[https://sepolia.etherscan.io/\[your txid\]](https://sepolia.etherscan.io/[your%20txid])

When you finish the test and debugging, switch the [ETH test network](https://console.ccpayment.com/merchatsetting/menu/settings) off.

Testing Sepolia ETH has no real value. It is only for testing purposes.  
**Webhook**

CCPayment notifies you of the real-time transaction statuses by sending the Webhook to your server.

When a merchant's server receives a Webhook request, it can parse the information in the payload and perform corresponding operations, such as updating order status or generating shipping notifications.

**Webhook Guide**

Deposits of coins in the "Tokens for your business" list will have webhook notifications sent. Deposits of non-supported coins for your business will not have webhook notifications sent to your server. Navigate to **Dashboard \> Settings \> Tokens for your business** to configure it.

[Question?](https://t.me/CCPaymentSupportBot)  
payments@fairstakegaming.com  
pay\*\*\*@fairstakegaming.comRole: Owner  
JavaPHPPythonNodeGolang  
**Introduction**

CCPayment is a cryptocurrency payment platform allowing merchants to accept and payout over 100 cryptocurrencies with the lowest fees on the market.

**Quick Guide**

**Credentials**

To establish communication with CCPayment systems, you need credentials for your Terminals.

**How to obtain Credentials**

Step1: Go to the registration page of CCPayment and [sign up](https://console.ccpayment.com/register) using your email address.

Step2: Log in and navigate to the **Dashboard \> developer** to obtain your **"APP ID"** and **"APP Secret"**, which will serve as your credentials to communicate with CCPayment.

**API Authentication and Specifications**

You will need "APP ID" and "APP Secret" to sign every message sent to CCPayment.

**Signature**

Prepare a signText by creating a string concatenating appId and timestamp, and append the request payload if present. Example: signText \= {Appid} \+ {timestamp} \+ Payload in JSON format

HMAC: Use SHA-256 hashing algorithm to compute the signature of the request data.

RSA: Use the RSA private key to sign the hashed data(SHA-256) and convert the signature into a Base64-encoded string.

10-digit timestamp  
The payload of the requests must be a JSON object. And the payload you sign should be exactly the same as the payload you send in the request.

**Before signing, here are a few things you should check:**

1\. Ensure the APP ID and App Secret are correct. You can check it on your [dashboard](https://console.ccpayment.com/developer/config). Note: If you use a random APP ID for any unauthorized actions, we will block the IP and APP ID after a number of requests.

2\. Make sure your website has been [verified](https://console.ccpayment.com/merchatsetting/menu/verification/index). Only verified merchant accounts have access to APIs.

3\. If you have set up an IP whitelist on your [dashboard](https://console.ccpayment.com/developer/config), ensure the IP address of your requests is included in your whitelist.

**Request Header**

To ensure the proper handling of your requests by the server, please include the following headers in each request

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| Appid | String | Yes | Your CCPayment APP ID |
| Timestamp | String | Yes | 10-digit timestamp. Valid in 2 minutes. Example: 1677152720 |
| Sign | String | Yes | Check the example on your right hand HMAC Example: 871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6 RSA Example: R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A== |

Headers for all requests made to CCPayment follow the same rule.

HMAC Signature Example

1var sign \= CryptoJS.HmacSHA256('The quick brown fox jumped over the lazy dog.',appSecret).toString();

API usage example  
getCoinList interface (no parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoinList';  
8const args \= '';  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

getCoin interface (need parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoin';  
8const args \= JSON.stringify({ "coinId": 1280 });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

RSA Signature Example

1*// Prepare data to be signed*  
2    const dataToSign \= apiID \+ timestamp \+ apiParams;  
3  
4    *// Load the private key*  
5    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
6  
7    *// Sign the data*  
8    const sign \= crypto.createSign('SHA256');  
9    sign.update(dataToSign);  
10    sign.end();  
11

12    const signature \= sign.sign(privateKey, 'base64');

API usage example  
getCoinList interface (need parameters):

1const crypto \= require('crypto');  
2const https \= require('https');  
3  
4*// Usage example*  
5const apiID \= "\*\*\* your app\_id \*\*\*";  
6const privateKeyPem \= \`-----BEGIN PRIVATE KEY-----  
7\*\*\* your PRIVATE KEY \*\*\*  
8\-----END PRIVATE KEY-----\`  
9const apiParams \= "";  
10const apiPath \= "https://ccpayment.com/ccpayment/v2/getCoinList";  
11  
12(async () \=\> {  
13  try {  
14    const response \= await signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath);  
15    console.log("Response:", response);  
16  } catch (err) {  
17    console.error("Error:", err);  
18  }  
19})();  
20  
21function signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath) {  
22  return new Promise((resolve, reject) \=\> {  
23    *// Calculate the timestamp*  
24    const timestamp \= Math.floor(Date.now() / 1000).toString();  
25  
26    *// Prepare data to be signed*  
27    const dataToSign \= apiID \+ timestamp \+ apiParams;  
28  
29    *// Load the private key*  
30    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
31  
32    *// Sign the data*  
33    const sign \= crypto.createSign('SHA256');  
34    sign.update(dataToSign);  
35    sign.end();  
36  
37    const signature \= sign.sign(privateKey, 'base64');  
38  
39    *// Send the request*  
40    const postData \= apiParams;  
41  
42    const url \= new URL(apiPath);  
43    const options \= {  
44      hostname: url.hostname,  
45      path: url.pathname \+ url.search,  
46      method: 'POST',  
47      headers: {  
48        'Appid': apiID,  
49        'Sign': signature,  
50        'Timestamp': timestamp,  
51        'Content-Type': 'application/x-www-form-urlencoded'  
52      }  
53    };  
54  
55    const req \= https.request(options, (res) \=\> {  
56      let data \= '';  
57  
58      *// Collect response data*  
59      res.on('data', (chunk) \=\> {  
60        data \+= chunk;  
61      });  
62  
63      *// Resolve the response when it ends*  
64      res.on('end', () \=\> {  
65        resolve(data);  
66      });  
67    });  
68  
69    *// Handle request error*  
70    req.on('error', (e) \=\> {  
71      reject(e);  
72    });  
73  
74    *// Write POST data*  
75    req.write(postData);  
76    req.end();  
77  });  
78}

79  
**FAQ**

**Parameter**

The request header must include three parameters: Appid, Timestamp (10-digit timestamp), and Sign.

**Order of the variables is not interchangable**

The correct order is {Appid} \+ {Timestamp} \+ {JASON object}

**Rules for API Calls**

| Rule | Description |
| :---- | :---- |
| Transfer Mode | HTTPS |
| Submit Mode | POST, may vary for different APIs |
| Content-Type | Application/Json |
| Char Encoding | UTF-8 |
| Signature Algorithm | HmacSHA-256 |

**Request Limits**

Check the specific interface documentation to know the exact information.

"Errorcode": "11004" means you have reached the rate limit.  
To increase the limit, please contact your CCPayment account manager.  
**Quick Guide**

**API Flow Diagram**

You can follow the process below to integrate with CCPayment's payment API. Or you can contact [CCPayment experts](https://t.me/CCPaymentSupportBot) for recommended integration solutions and troubleshooting technical issues.  
**Deposit by Orders**

**![][image4]**

**Deposit by Permanent Addresses**

**![][image5]**

**Withdrawal**

**![][image6]**  
**Testnet**

If you would like to test your integration with test currencies, you can use ETH Sepolia to test the functions. Navigate to **CCPayment dashboard \>** **Merchant Settings \>** **Merchant Settings \>** **ETH test network** and turn the switch on to enable test network.

Get free test Sepolia ETH:  
Faucets are online resources where you can receive free testnet coins.

[https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

[https://sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de/)

[https://www.allthatnode.com/faucet/ethereum.dsrv](https://www.allthatnode.com/faucet/ethereum.dsrv)

[https://faucet.quicknode.com/drip](https://faucet.quicknode.com/drip)

Check the transaction details on blockchain explorer

[https://sepolia.etherscan.io/\[your txid\]](https://sepolia.etherscan.io/[your%20txid])

When you finish the test and debugging, switch the [ETH test network](https://console.ccpayment.com/merchatsetting/menu/settings) off.

Testing Sepolia ETH has no real value. It is only for testing purposes.  
**Webhook**

CCPayment notifies you of the real-time transaction statuses by sending the Webhook to your server.

When a merchant's server receives a Webhook request, it can parse the information in the payload and perform corresponding operations, such as updating order status or generating shipping notifications.

**Webhook Guide**

Deposits of coins in the "Tokens for your business" list will have webhook notifications sent. Deposits of non-supported coins for your business will not have webhook notifications sent to your server. Navigate to **Dashboard \> Settings \> Tokens for your business** to configure it.

![][image7]

**Set Webhook URL**

Go to Dashboard \> [Developer](https://console.ccpayment.com/developer/config) \> Webhook URL to set your Webhook receiving URL.

Please note that if your server has an IP whitelist configured, make sure to add our Webhook sending IPs (54.150.123.157, 35.72.150.75 and 18.176.186.244) to the whitelist.

![][image8]  
**Transaction Statuses in Webhook**

CCPayment will send Webhook notifications based on different transaction statuses:

1\. **Pending**: A notification may be sent when the system detects that a transaction has been sent to the blockchain, indicating that the transaction process has started.

2\. **Processing**: A notification may be sent when the transaction is being processed on the blockchain, signaling that it is in progress and yet to be finalized.

3\. **Final statuses**: When the transaction reaches a final status, "success", "failed", or "rejected", CCPayment will send a notification to your server accordingly.

Only when the transaction status is "**Success**", will the transaction be credited. Other transaction statuses carry the risk of cancellation or failure.  
**How to Handle Incoming Webhooks**

1\. Always verify if signature provided in webhook matches the one you generate on your own.

* Obtain the value of sign from the request header and other necessary parameters. The request header parameters are as follows.

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| Appid | String | Yes | Your CCPayment APP ID |
| Timestamp | String | Yes | 10-digit timestamp. Valid in 2 minutes. Example: 1677152720 |
| Sign | String | Yes | Check the example code on the right HMAC Example: 871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6 RSA Example: R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A== |

*   
  {Appid} \+ {timestamp} \+ PayloadJSON. Please refer to the [signature documentation](https://ccpayment.com/api/doc?en#api-authentication-and-specifications). (See the signature verification code example on the right)

**HMAC signature verificaiton**

* Use HMAC-SHA256 to generate the Sign value.  
* Compare the generated sign value with the one sent in the request header.  
* If the two sign values are equal, the verification is a success. You can proceed to handle the webhook request. If the sign values do not match, the verification will fail, which indicates the request may have been tampered with.

RSA Signature Verification:

* Decode the Base64-encoded signature received in the request.  
* Use the RSA private key to decrypt the decoded signature.  
* The decrypted data should reveal a string composed of {APP ID} \+ {Timestamp} \+ Payload JSON object}.  
* Compare the decrypted string with the expected concatenation of {APP ID} \+ {Timestamp} \+ Payload JSON object}  
* If the two strings match, the verification is successful, and you can proceed to handle the webhook request. If the strings do not match, the verification fails, indicating that the request may have been tampered with.

2\. **Parse the Payload**: Use the recordID or referenceID in the payload of webhook to retrieve transaction details by calling the interface. Credit users based on transaction details returned by the interface.

3\. **Response**: After receiving a Webhook notification, set the response body format to: "Content-Type: text/plain; charset=utf-8" and return {http code: 200}. Include a "Success" string in the HTTP Payload. When CCPayment receives the right response, we will stop pushing the notification.

![][image9]  
Signature verification example

1const express \= require('express');  
2const crypto \= require('crypto');  
3const app \= express();  
4function verifySignature(content, signature, app\_id, app\_secret, timestamp) {  
5  let sign\_text \= \`${app\_id}${timestamp}${content}\`;  
6  let server\_sign \= crypto.createHmac('sha256', app\_secret).update(sign\_text).digest('hex');  
7  return signature \=== server\_sign;  
8}  
9app.use(express.text());  
10app.post('/webhook', (req, res) \=\> {  
11    const app\_id \= 'your\_app\_id';  
12    const app\_secret \= 'your\_app\_secret';  
13    const timestamp \= req.header('Timestamp');  
14    const sign \= req.header('Sign');  
15    const sign\_text \= req.body;  
16    if (verifySignature(sign\_text, sign, app\_id, app\_secret, timestamp)) {  
17        res.send('success');  
18    } else {  
19        res.status(401).send('Invalid signature');  
20    }  
21});  
22app.listen(3000, () \=\> {  
23    console.log('Server is running on port 3000');  
24});  
**Retry Logic**

If CCPayment does not receive HTTP 200 with a "Success" string in the response body, we will try to reach endpoint again up to 6 times.

Retry Interval

* 30 seconds  
* 1 minute 30 seconds  
* 3 minute 30 seconds  
* 7 minute 30 seconds  
* 15 minute 30 seconds  
* 31 minute 30 seconds

Merchants must implement idempotency in their code upon receiving Webhook notifications to prevent multiple crediting for one payment.  
**Idempotency Implementation for Transactions**

Overview

To prevent the processing of duplicate transactions due to network issues or retry mechanisms, the system must ensure that each transaction is processed only once. This can be achieved using **idempotency**, where the **TxID** (transaction hash ID) or another unique identifier serves as the basis for checking and ensuring that a transaction is not processed more than once.

How to Implement Idempotency

* Upon receiving a deposit notification from CCPayment, check if the transaction is already recorded in the database based on the **TxID**. If it exists, skip processing to prevent duplicate credits.

Example

1if (db.includes(txId)) {  
2    console.log("Transaction has already been processed");  
3} else {  
4    *// business processing logic*  
5    *// record transaction to db*  
6}  
**View Webhook Notification Logs and Resend Webhooks:**

Navigate to [Dashboard \> Webhook](https://console.ccpayment.com/webhook/index) to view webhook logs. You can also resend one webhook or multiple webhooks in batch on this page.  
![][image10]  
**Resend Webhook by Calling API**

Resend webhooks for transactions within a specified time period through this interface.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/webhook/resend

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| recordIds | Array | No | Specify the record IDs to resend the webhook. A maximum of 50 webhooks can be resent in one batch. |
| startTimestamp | Integer | Yes | Resend webhooks for all transactions created after this start time. It should be a 10-digit timestamp |
| endTimestamp | Integer | No | Resend webhooks for all transactions created before this start time. It should be a 10-digit timestamp If the `end_timestamp` is empty, resend webhooks for all transaction created within one hour after the start time. Note: The maximum time difference between `end_timestamp` and `start_timestamp` is 1 hour. |
| webhookResult | String | No | `Failed`: (Default) Only resend failed webhooks within the specified time range. `AllResult`: Resend all webhooks within the specified time range. |
| transactionType | String | No | Which type of transactions will the webhooks be resent `AllType`: (Default) Resend all types `ApiDeposit`: Resend API deposit transactions `DirectDeposit`: Resend permanent address deposit transactions `ApiWithdrawal`: Resend API withdrawal transactions `UserDeposit`: Resend user deposit transactions `UserWithdrawal`: Resend user withdrawal transactions |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/webhook/resend';  
8const args \= JSON.stringify({"startTimestamp": 1710145756});  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |   |
| data.resendCount | Integer | Number of webhooks successfully resent in the specified timeframe. |

Result Example

1{  
2      "code": 10000,  
3      "msg": "Success",  
4      "data": {  
5        "resendCount": 1,  
6      }  
7  }  
8     
**Support**

[Question?](https://t.me/CCPaymentSupportBot)  
payments@fairstakegaming.com  
pay\*\*\*@fairstakegaming.comRole: Owner  
JavaPHPPythonNodeGolang  
**Introduction**

CCPayment is a cryptocurrency payment platform allowing merchants to accept and payout over 100 cryptocurrencies with the lowest fees on the market.

**Quick Guide**

**Credentials**

To establish communication with CCPayment systems, you need credentials for your Terminals.

**How to obtain Credentials**

Step1: Go to the registration page of CCPayment and [sign up](https://console.ccpayment.com/register) using your email address.

Step2: Log in and navigate to the **Dashboard \> developer** to obtain your **"APP ID"** and **"APP Secret"**, which will serve as your credentials to communicate with CCPayment.

**API Authentication and Specifications**

You will need "APP ID" and "APP Secret" to sign every message sent to CCPayment.

**Signature**

Prepare a signText by creating a string concatenating appId and timestamp, and append the request payload if present. Example: signText \= {Appid} \+ {timestamp} \+ Payload in JSON format

HMAC: Use SHA-256 hashing algorithm to compute the signature of the request data.

RSA: Use the RSA private key to sign the hashed data(SHA-256) and convert the signature into a Base64-encoded string.

10-digit timestamp  
The payload of the requests must be a JSON object. And the payload you sign should be exactly the same as the payload you send in the request.

**Before signing, here are a few things you should check:**

1\. Ensure the APP ID and App Secret are correct. You can check it on your [dashboard](https://console.ccpayment.com/developer/config). Note: If you use a random APP ID for any unauthorized actions, we will block the IP and APP ID after a number of requests.

2\. Make sure your website has been [verified](https://console.ccpayment.com/merchatsetting/menu/verification/index). Only verified merchant accounts have access to APIs.

3\. If you have set up an IP whitelist on your [dashboard](https://console.ccpayment.com/developer/config), ensure the IP address of your requests is included in your whitelist.

**Request Header**

To ensure the proper handling of your requests by the server, please include the following headers in each request

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| Appid | String | Yes | Your CCPayment APP ID |
| Timestamp | String | Yes | 10-digit timestamp. Valid in 2 minutes. Example: 1677152720 |
| Sign | String | Yes | Check the example on your right hand HMAC Example: 871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6 RSA Example: R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A== |

Headers for all requests made to CCPayment follow the same rule.

HMAC Signature Example

1var sign \= CryptoJS.HmacSHA256('The quick brown fox jumped over the lazy dog.',appSecret).toString();

API usage example  
getCoinList interface (no parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoinList';  
8const args \= '';  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

getCoin interface (need parameters):

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoin';  
8const args \= JSON.stringify({ "coinId": 1280 });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();

RSA Signature Example

1*// Prepare data to be signed*  
2    const dataToSign \= apiID \+ timestamp \+ apiParams;  
3  
4    *// Load the private key*  
5    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
6  
7    *// Sign the data*  
8    const sign \= crypto.createSign('SHA256');  
9    sign.update(dataToSign);  
10    sign.end();  
11

12    const signature \= sign.sign(privateKey, 'base64');

API usage example  
getCoinList interface (need parameters):

1const crypto \= require('crypto');  
2const https \= require('https');  
3  
4*// Usage example*  
5const apiID \= "\*\*\* your app\_id \*\*\*";  
6const privateKeyPem \= \`-----BEGIN PRIVATE KEY-----  
7\*\*\* your PRIVATE KEY \*\*\*  
8\-----END PRIVATE KEY-----\`  
9const apiParams \= "";  
10const apiPath \= "https://ccpayment.com/ccpayment/v2/getCoinList";  
11  
12(async () \=\> {  
13  try {  
14    const response \= await signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath);  
15    console.log("Response:", response);  
16  } catch (err) {  
17    console.error("Error:", err);  
18  }  
19})();  
20  
21function signWithPrivateKey(apiID, privateKeyPem, apiParams, apiPath) {  
22  return new Promise((resolve, reject) \=\> {  
23    *// Calculate the timestamp*  
24    const timestamp \= Math.floor(Date.now() / 1000).toString();  
25  
26    *// Prepare data to be signed*  
27    const dataToSign \= apiID \+ timestamp \+ apiParams;  
28  
29    *// Load the private key*  
30    const privateKey \= crypto.createPrivateKey(privateKeyPem);  
31  
32    *// Sign the data*  
33    const sign \= crypto.createSign('SHA256');  
34    sign.update(dataToSign);  
35    sign.end();  
36  
37    const signature \= sign.sign(privateKey, 'base64');  
38  
39    *// Send the request*  
40    const postData \= apiParams;  
41  
42    const url \= new URL(apiPath);  
43    const options \= {  
44      hostname: url.hostname,  
45      path: url.pathname \+ url.search,  
46      method: 'POST',  
47      headers: {  
48        'Appid': apiID,  
49        'Sign': signature,  
50        'Timestamp': timestamp,  
51        'Content-Type': 'application/x-www-form-urlencoded'  
52      }  
53    };  
54  
55    const req \= https.request(options, (res) \=\> {  
56      let data \= '';  
57  
58      *// Collect response data*  
59      res.on('data', (chunk) \=\> {  
60        data \+= chunk;  
61      });  
62  
63      *// Resolve the response when it ends*  
64      res.on('end', () \=\> {  
65        resolve(data);  
66      });  
67    });  
68  
69    *// Handle request error*  
70    req.on('error', (e) \=\> {  
71      reject(e);  
72    });  
73  
74    *// Write POST data*  
75    req.write(postData);  
76    req.end();  
77  });  
78}

79  
**FAQ**

**Parameter**

The request header must include three parameters: Appid, Timestamp (10-digit timestamp), and Sign.

**Order of the variables is not interchangable**

The correct order is {Appid} \+ {Timestamp} \+ {JASON object}

**Rules for API Calls**

| Rule | Description |
| :---- | :---- |
| Transfer Mode | HTTPS |
| Submit Mode | POST, may vary for different APIs |
| Content-Type | Application/Json |
| Char Encoding | UTF-8 |
| Signature Algorithm | HmacSHA-256 |

**Request Limits**

Check the specific interface documentation to know the exact information.

"Errorcode": "11004" means you have reached the rate limit.  
To increase the limit, please contact your CCPayment account manager.  
**Quick Guide**

**API Flow Diagram**

You can follow the process below to integrate with CCPayment's payment API. Or you can contact [CCPayment experts](https://t.me/CCPaymentSupportBot) for recommended integration solutions and troubleshooting technical issues.  
**Deposit by Orders**

**![][image11]**

**Deposit by Permanent Addresses**

**![][image12]**

**Withdrawal**

**![][image13]**  
**Testnet**

If you would like to test your integration with test currencies, you can use ETH Sepolia to test the functions. Navigate to **CCPayment dashboard \>** **Merchant Settings \>** **Merchant Settings \>** **ETH test network** and turn the switch on to enable test network.

Get free test Sepolia ETH:  
Faucets are online resources where you can receive free testnet coins.

[https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

[https://sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de/)

[https://www.allthatnode.com/faucet/ethereum.dsrv](https://www.allthatnode.com/faucet/ethereum.dsrv)

[https://faucet.quicknode.com/drip](https://faucet.quicknode.com/drip)

Check the transaction details on blockchain explorer

[https://sepolia.etherscan.io/\[your txid\]](https://sepolia.etherscan.io/[your%20txid])

When you finish the test and debugging, switch the [ETH test network](https://console.ccpayment.com/merchatsetting/menu/settings) off.

Testing Sepolia ETH has no real value. It is only for testing purposes.  
**Webhook**

CCPayment notifies you of the real-time transaction statuses by sending the Webhook to your server.

When a merchant's server receives a Webhook request, it can parse the information in the payload and perform corresponding operations, such as updating order status or generating shipping notifications.

**Webhook Guide**

Deposits of coins in the "Tokens for your business" list will have webhook notifications sent. Deposits of non-supported coins for your business will not have webhook notifications sent to your server. Navigate to **Dashboard \> Settings \> Tokens for your business** to configure it.

![][image14]

**Set Webhook URL**

Go to Dashboard \> [Developer](https://console.ccpayment.com/developer/config) \> Webhook URL to set your Webhook receiving URL.

Please note that if your server has an IP whitelist configured, make sure to add our Webhook sending IPs (54.150.123.157, 35.72.150.75 and 18.176.186.244) to the whitelist.

![][image15]  
**Transaction Statuses in Webhook**

CCPayment will send Webhook notifications based on different transaction statuses:

1\. **Pending**: A notification may be sent when the system detects that a transaction has been sent to the blockchain, indicating that the transaction process has started.

2\. **Processing**: A notification may be sent when the transaction is being processed on the blockchain, signaling that it is in progress and yet to be finalized.

3\. **Final statuses**: When the transaction reaches a final status, "success", "failed", or "rejected", CCPayment will send a notification to your server accordingly.

Only when the transaction status is "**Success**", will the transaction be credited. Other transaction statuses carry the risk of cancellation or failure.  
**How to Handle Incoming Webhooks**

1\. Always verify if signature provided in webhook matches the one you generate on your own.

* Obtain the value of sign from the request header and other necessary parameters. The request header parameters are as follows.

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| Appid | String | Yes | Your CCPayment APP ID |
| Timestamp | String | Yes | 10-digit timestamp. Valid in 2 minutes. Example: 1677152720 |
| Sign | String | Yes | Check the example code on the right HMAC Example: 871f0223c66ea72435208d03603a0cb00b90f6ac4a4ba725d00164d967e291f6 RSA Example: R3l4l53fLcQ9mVRFVzXMk5CN5KTbKq5jdEaQZJ9z6+IoYQjCW1/36FJGx6YG/yC3kBErf2p5A== |

*   
  {Appid} \+ {timestamp} \+ PayloadJSON. Please refer to the [signature documentation](https://ccpayment.com/api/doc?en#api-authentication-and-specifications). (See the signature verification code example on the right)

**HMAC signature verificaiton**

* Use HMAC-SHA256 to generate the Sign value.  
* Compare the generated sign value with the one sent in the request header.  
* If the two sign values are equal, the verification is a success. You can proceed to handle the webhook request. If the sign values do not match, the verification will fail, which indicates the request may have been tampered with.

RSA Signature Verification:

* Decode the Base64-encoded signature received in the request.  
* Use the RSA private key to decrypt the decoded signature.  
* The decrypted data should reveal a string composed of {APP ID} \+ {Timestamp} \+ Payload JSON object}.  
* Compare the decrypted string with the expected concatenation of {APP ID} \+ {Timestamp} \+ Payload JSON object}  
* If the two strings match, the verification is successful, and you can proceed to handle the webhook request. If the strings do not match, the verification fails, indicating that the request may have been tampered with.

2\. **Parse the Payload**: Use the recordID or referenceID in the payload of webhook to retrieve transaction details by calling the interface. Credit users based on transaction details returned by the interface.

3\. **Response**: After receiving a Webhook notification, set the response body format to: "Content-Type: text/plain; charset=utf-8" and return {http code: 200}. Include a "Success" string in the HTTP Payload. When CCPayment receives the right response, we will stop pushing the notification.

![][image16]  
Signature verification example

1const express \= require('express');  
2const crypto \= require('crypto');  
3const app \= express();  
4function verifySignature(content, signature, app\_id, app\_secret, timestamp) {  
5  let sign\_text \= \`${app\_id}${timestamp}${content}\`;  
6  let server\_sign \= crypto.createHmac('sha256', app\_secret).update(sign\_text).digest('hex');  
7  return signature \=== server\_sign;  
8}  
9app.use(express.text());  
10app.post('/webhook', (req, res) \=\> {  
11    const app\_id \= 'your\_app\_id';  
12    const app\_secret \= 'your\_app\_secret';  
13    const timestamp \= req.header('Timestamp');  
14    const sign \= req.header('Sign');  
15    const sign\_text \= req.body;  
16    if (verifySignature(sign\_text, sign, app\_id, app\_secret, timestamp)) {  
17        res.send('success');  
18    } else {  
19        res.status(401).send('Invalid signature');  
20    }  
21});  
22app.listen(3000, () \=\> {  
23    console.log('Server is running on port 3000');  
24});  
**Retry Logic**

If CCPayment does not receive HTTP 200 with a "Success" string in the response body, we will try to reach endpoint again up to 6 times.

Retry Interval

* 30 seconds  
* 1 minute 30 seconds  
* 3 minute 30 seconds  
* 7 minute 30 seconds  
* 15 minute 30 seconds  
* 31 minute 30 seconds

Merchants must implement idempotency in their code upon receiving Webhook notifications to prevent multiple crediting for one payment.  
**Idempotency Implementation for Transactions**

Overview

To prevent the processing of duplicate transactions due to network issues or retry mechanisms, the system must ensure that each transaction is processed only once. This can be achieved using **idempotency**, where the **TxID** (transaction hash ID) or another unique identifier serves as the basis for checking and ensuring that a transaction is not processed more than once.

How to Implement Idempotency

* Upon receiving a deposit notification from CCPayment, check if the transaction is already recorded in the database based on the **TxID**. If it exists, skip processing to prevent duplicate credits.

Example

1if (db.includes(txId)) {  
2    console.log("Transaction has already been processed");  
3} else {  
4    *// business processing logic*  
5    *// record transaction to db*  
6}  
**View Webhook Notification Logs and Resend Webhooks:**

Navigate to [Dashboard \> Webhook](https://console.ccpayment.com/webhook/index) to view webhook logs. You can also resend one webhook or multiple webhooks in batch on this page.  
![][image17]  
**Resend Webhook by Calling API**

Resend webhooks for transactions within a specified time period through this interface.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/webhook/resend

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| recordIds | Array | No | Specify the record IDs to resend the webhook. A maximum of 50 webhooks can be resent in one batch. |
| startTimestamp | Integer | Yes | Resend webhooks for all transactions created after this start time. It should be a 10-digit timestamp |
| endTimestamp | Integer | No | Resend webhooks for all transactions created before this start time. It should be a 10-digit timestamp If the `end_timestamp` is empty, resend webhooks for all transaction created within one hour after the start time. Note: The maximum time difference between `end_timestamp` and `start_timestamp` is 1 hour. |
| webhookResult | String | No | `Failed`: (Default) Only resend failed webhooks within the specified time range. `AllResult`: Resend all webhooks within the specified time range. |
| transactionType | String | No | Which type of transactions will the webhooks be resent `AllType`: (Default) Resend all types `ApiDeposit`: Resend API deposit transactions `DirectDeposit`: Resend permanent address deposit transactions `ApiWithdrawal`: Resend API withdrawal transactions `UserDeposit`: Resend user deposit transactions `UserWithdrawal`: Resend user withdrawal transactions |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/webhook/resend';  
8const args \= JSON.stringify({"startTimestamp": 1710145756});  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'Appid': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |   |
| data.resendCount | Integer | Number of webhooks successfully resent in the specified timeframe. |

Result Example

1{  
2      "code": 10000,  
3      "msg": "Success",  
4      "data": {  
5        "resendCount": 1,  
6      }  
7  }  
8     
**Support**

**FAQ**

**Which deposit interface should I use for my business?**

1\. Deposit by orders

* Industry: E-commerce, product-related business. Deposits will be linked to orders and have a requirement for a fixed amount.  
* The deposit address for order has a valid time. After the expiration time of the order, the merchant will still receive the deposit to this address for 7 days.  
* API documentation: [Create Deposit Address for Order](https://ccpayment.com/api/doc?en#create-deposit-address-for-order)

2\. Deposit by permanent addresses

* Industry: gaming, streaming, social platforms. Deposits will be linked to users and have no requirement for a fixed amount.  
* The deposit address is assigned to one user. After the assignment, users can save the deposit address and make payments to this address anytime they want. Whenever there is a payment to the address, the merchant's server will receive a notification.  
* API documentation: [Get Permanent Deposit Address](https://ccpayment.com/api/doc?en#get-permanent-deposit-address)

Contact your [account manager](https://t.me/CCPaymentSupportBot) to get more details.

**Status Code**

Status codes represent the processing status of API requests.

| Status code | Tip | Description |
| :---- | :---- | :---- |
| 10000 | Success | The request has been successfully processed, and the system has returned the required information. |
| 10001 | Failed | Request failed. Please refer to the detailed error message to adjust your request or take necessary steps to resolve the issue. |

**Error Code**

Common Errors

| Error code | Error tip | Error description |
| :---- | :---- | :---- |
| 11000 | InvalidArgument | Invalid argument |
| 11001 | HeaderInvalidArgument | Invalid argument in header |
| 11002 | Internal | We may have a problem with our server. Try again later or report to our [support team](https://t.me/CCPaymentSupportBot). |
| 11003 | NotFound | Data does not exist |
| 11004 | RateLimit | Reached the rate limit. Reduce the frequency of your request |
| 11005 | VerifySignFailed | Signature verification failed |
| 11006 | ReqExpired | Request has expired |
| 11007 | RepeatedSubmit | Repeated submission |
| 11008 | QueryDurationTooMax | Query time range cannot be too large |
| 11009 | ReqDailyLimit | Exceeded daily request limit |
| 11010 | QueryNumMax | The number of transactions queried is too large. Maximum: 100 |
| 11011 | OrderDuplicate | Order ID is repeated |
| 11012 | ExpiredAtTooMax | The maximum valid period is 10 days |
| 11013 | NoSupportVersion | This account can only access the Version 1 interface |
| 11014 | MaliciousReq | Malicious request, this IP has been banned |
| 11015 | UserIdNotFound | userId does not exist |

Account Errors

| Error code | Error tip | Error description |
| :---- | :---- | :---- |
| 12000 | MerchantDisabled | Merchant account disabled |
| 12001 | MerchantNotFound | Merchant does not exist |
| 12002 | IpNotInWhitelist | IP not in whitelist, please check the IP whitelist settings on the developer page |
| 12003 | MerchantApiDisabled | Please go to dashboard to complete website verification |

Token Errors

| Error code | Error tip | Error description |
| :---- | :---- | :---- |
| 13000 | InvalidCoin | Unsupported coin |
| 13001 | InvalidChain | Unsupported network for this token |
| 13002 | AbnormalCoinPrice | Abnormal coin price |
| 13003 | AbnormalCoinPriceNotSupportMode | Abnormal coin price, only supports merchants paying network fees |
| 13004 | UnstableBlockchain | Unstable blockchain. Withdrawal of this coin is not available. Please try it later. |

Withdrawal Errors

| Error code | Error tip | Error description |
| :---- | :---- | :---- |
| 14000 | BalanceInsufficient | There is not enough balance for withdrawal |
| 14001 | WithdrawFeeTooLow | Withdrawal network fee is too low. Check the real-time network fee by calling [network fee interface](https://ccpayment.com/api/doc?en#get-withdrawal-network-fee) |
| 14002 | AddressNotActive | Invalid/Inactive receiving address, please check if the address is valid |
| 14003 | AddressEmptyMemo | Memo for this chain cannot be empty |
| 14004 | ChainStopWithdraw | Withdrawals on this chain are temporarily suspended |
| 14005 | WithdrawValueLessThanLimit | Withdrawal amount is less than the minimum withdrawal limit. Please check the limit for this coin by calling the [Get Available Token List](https://ccpayment.com/api/doc?en#get-token-list). |
| 14006 | WithdrawValueMoreThanLimit | Withdrawal amount exceeds the maximum withdrawal limit. |
| 14007 | WithdrawAddrFormat | Incorrect withdrawal address format |
| 14008 | WithdrawCannotSelf | Can not withdraw to your own CCPayment address |
| 14009 | CoinNoSupportMemo | This coin does not support memo |
| 14010 | NoSupportCoin | Merchant does not support this token. Please go to the merchant settings or use the "Get Token List" interface to view supported tokens |
| 14011 | WithdrawFeeBalanceNotEnough | Insufficient native token for paying network fee |
| 14012 | NotSupportMerchantTransfer | Transfer by Merchant account ID is only supported between main account and sub-accounts. |
| 14013 | CoinPrecisionLimit | Exceeded coin precision limit |
| 14014 | NotFinishCollection | Unpaid assets aggregation fees. See [the details](https://console.ccpayment.com/transaction/collect-list) on your dashboard and deposit USDT to pay the outstanding balance |
| 14015 | WithdrawToContractAddress | Can not be withdrawn to contract addresses |
| 14016 | WithdrawInvalidAddressType | Address type error, we only support transfer to data accounts. |

Deposit Errors

| Error code | Error tip | Error description |
| :---- | :---- | :---- |
| 15000 | GenerateAddressFailed | Fail to generate address, please try again |
| 15001 | PaymentAddressNumTooMuch | Available deposit addresses for this account reached the maximum limit |
| 15003 | ChainStopDeposit | Deposits for this chain are suspended |

**Contact Us**

Please feel free to contact support from CCPayment if you have any questions about integration.

Telegram support: [https://t.me/CCPaymentSupportBot](https://t.me/CCPaymentSupportBot)

E-mail: support@ccpayment.com

**Common API**

**Get Token List**

This endpoint retrieves all details of tokens you've enabled for your business.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getCoinList

Parameters

| Parameters | Type | Required | Description |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| No parameters required |  |  |  |  |  |  |  |  |  |  |  |

Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/getCoinList";  
8const args \= "";  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac("sha256", appSecret)  
18  .update(signText)  
19  .digest("hex");  
20  
21const options \= {  
22  method: "POST",  
23  headers: {  
24    "Content-Type": "application/json",  
25    "Appid": appId,  
26    "Sign": sign,  
27    "Timestamp": timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= "";  
33  
34res.on("data", (chunk) \=\> {  
35  respData \+= chunk;  
36});  
37  
38res.on("end", () \=\> {  
39  console.log("Response:", respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.coins | Array |  |
| data.coins\[index\].coinId | Integer | Coin ID |
| data.coins\[index\].symbol | String | Coin symbol |
| data.coins\[index\].coinFullName | String | Coin full name |
| data.coins\[index\].logoUrl | String | Coin logo |
| data.coins\[index\].status | String | Coin status:  `Normal`: available deposit/withdrawal;  `Maintain`: withdrawal suspended;   `Pre-delisting`: deposit suspended;   `Delisted`: deposit/withdrawal suspended |
| data.coins\[index\].networks | Object | List of supported networks for this coin |
| data.coins\[index\].networks.AVAX | Object |  |
| data.coins\[index\].networks.AVAX.chain | String | Symbol of the chain |
| data.coins\[index\].networks.AVAX.chainFullName | String | Full name of the chain |
| data.coins\[index\].networks.AVAX.contract | String | Coin contract |
| data.coins\[index\].networks.AVAX.precision | Integer | Precision |
| data.coins\[index\].networks.AVAX.canDeposit | Boolean | Deposit status |
| data.coins\[index\].networks.AVAX.canWithdraw | Boolean | Withdrawal status |
| data.coins\[index\].networks.AVAX.minimumDepositAmount | String | Minimal deposit amount |
| data.coins\[index\].networks.AVAX.minimumWithdrawAmount | String | Minimal withdrawal amount |
| data.coins\[index\].networks.AVAX.maximumWithdrawAmount | String | Maximum withdrawal amount. If the value is 0, there is no maximum amount for this coin |
| data.coins\[index\].networks.AVAX.isSupportMemo | Boolean | Whether transactions on this chain require a memo |

Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5      "coins": \[  
6        {  
7          "coinId": 1207,  
8          "symbol": "LINK",  
9          "coinFullName":"ChainLink Token",  
10          "logoUrl": "https://resource.cwallet.com/token/icon/link.png",  
11          "status": "Normal",  
12          "networks": {  
13            "BSC": {  
14              "chain": "BSC",  
15              "chainFullName": "Binance Smart Chain",  
16              "contract": "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",  
17              "precision": 18,  
18              "canDeposit": true,  
19              "canWithdraw": true,  
20              "minimumDepositAmount": "0",  
21              "minimumWithdrawAmount": "0.025",  
22              "maximumWithdrawAmount": "0",  
23              "isSupportMemo": false  
24            },  
25            "ETH": {  
26              "chain": "ETH",  
27              "chainFullName": "Ethereum",  
28              "contract": "0x514910771af9ca656af840dff83e8264ecf986ca",  
29              "precision": 18,  
30              "canDeposit": true,  
31              "canWithdraw": true,  
32              "minimumDepositAmount": "0",  
33              "minimumWithdrawAmount": "0.025",  
34              "maximumWithdrawAmount": "0",  
35              "isSupportMemo": false  
36            }  
37          }  
38        },  
39        ...  
40      \]  
41    }  
42  }

**Get Token Information**

This endpoint retrieves the detailed information of one specific token

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getCoin

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |

TTP Request

POSThttps://ccpayment.com/ccpayment/v2/getCoin

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoin';  
8const args \= JSON.stringify({ 'coinId': 1280 });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24'Content-Type': 'application/json',  
25'Appid': appId,  
26'Sign': sign,  
27'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.coin | Array |  |
| data.coin\[index\].coinId | Integer | Coin ID |
| data.coin\[index\].symbol | String | Coin symbol |
| data.coin\[index\].coinFullName | String | Coin full name |
| data.coin\[index\].logoUrl | String | Coin logo |
| data.coin\[index\].status | String | Coin status:  `Normal`: available deposit/withdrawal;  `Maintain`: withdrawal suspended;   `Pre-delisting`: deposit suspended;   `Delisted`: deposit/withdrawal suspended |
| data.coin\[index\].networks | Object | List of supported networks for this coin |
| data.coin\[index\].networks\[chain\] | Object |  |
| data.coin\[index\].networks\[chain\].chain | String | Symbol of the chain |
| data.coin\[index\].networks\[chain\].chainFullName | String | Full name of the chain |
| data.coin\[index\].networks\[chain\].contract | String | Coin contract |
| data.coin\[index\].networks\[chain\].precision | Integer | Precision |
| data.coin\[index\].networks\[chain\].canDeposit | Boolean | Deposit status |
| data.coin\[index\].networks\[chain\].canWithdraw | Boolean | Withdrawal status |
| data.coin\[index\].networks\[chain\].minimumDepositAmount | String | Minimal deposit amount |
| data.coin\[index\].networks\[chain\].minimumWithdrawAmount | String | Minimal withdrawal amount |
| data.coin\[index\].networks\[chain\].maximumWithdrawAmount | String | Maximum withdrawal amount. If the value is 0, there is no maximum amount for this coin |
| data.coin\[index\].networks\[chain\].isSupportMemo | Boolean | Whether transactions on this chain require a memo |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5  "coin": {  
6  "coinId": 1329,  
7  "symbol": "MATIC",  
8  "coinFullName":"Matic Token",  
9  "logoUrl": "https://resource.cwallet.com/token/icon/matic.png",  
10  "status": "Normal",  
11  "networks": {  
12    "BSC": {  
13      "chain": "BSC",  
14      "chainFullName": "Binance Smart Chain",  
15      "contract": "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",  
16      "precision": 18,  
17      "canDeposit": true,  
18      "canWithdraw": true,  
19      "minimumDepositAmount": "0",  
20      "minimumWithdrawAmount": "0.025",  
21      "maximumWithdrawAmount": "0",  
22      "isSupportMemo": false  
23    },  
24    "ETH": {  
25      "chain": "ETH",  
26      "chainFullName": "Ethereum",  
27      "contract": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",  
28      "precision": 18,  
29      "canDeposit": true,  
30      "canWithdraw": true,  
31      "minimumDepositAmount": "0",  
32      "minimumWithdrawAmount": "0.025",  
33      "maximumWithdrawAmount": "0",  
34      "isSupportMemo": false  
35    },  
36    "POLYGON": {  
37      "chain": "POLYGON",  
38      "chainFullName": "Polygon",  
39      "contract": "137",  
40      "precision": 18,  
41      "canDeposit": true,  
42      "canWithdraw": true,  
43      "minimumDepositAmount": "0",  
44      "minimumWithdrawAmount": "0.025",  
45      "maximumWithdrawAmount": "0",  
46      "isSupportMemo": false  
47    }  
48  }  
49  }  
50  }  
51  }  
52   

**Get Token Price**

POSThttps://ccpayment.com/ccpayment/v2/getCoinUSDTPrice

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinIds | Array | Yes | Array of coin IDs |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCoinUSDTPrice';  
8const args \= JSON.stringify({ 'coinIds': \[1280\] });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24'Content-Type': 'application/json',  
25'Appid': appId,  
26'Sign': sign,  
27'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.prices | Object |  |
| data.prices\[coinId\] | String | Equivalent USDT value of this coin |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5  "prices": {  
6    "1329": "1.1683"  
7   }  
8  }  
9  }  
**Get Cwallet User Information**

Pass Cwallet ID to this endpoint to see if the provided ID belongs to a Cwallet user and retrieve its username.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getCwalletUserId

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| cwalletUserId | String | Yes | Cwallet user ID |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getCwalletUserId';  
8const args \= JSON.stringify({ 'cwalletUserId': '9558861' });  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24  'Content-Type': 'application/json',  
25  'Appid': appId,  
26  'Sign': sign,  
27  'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.cwalletUserId | String | Cwallet user ID |
| data.cwalletUserName | String | Cwallet user name |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5  "cwalletUserId": "35255142",  
6  "cwalletUserName": "j\*\*\*@proton.me"  
7  }  
8  }  
**Check Withdrawal Address Validity**

Provide the withdrawal address to this endpoint to verify if it's eligible to receive the transfer.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/checkWithdrawalAddressValidity

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| chain | String | Yes | Symbol of the network, for example 'AVAX' for Avalanche |
| address | String | Yes | Receiving address of withdrawal |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/checkWithdrawalAddressValidity';  
8const args \= JSON.stringify({ 'chain': "POLYGON" ,'address':'0x43fEeF6879286BBAC5082f17AD3dA55EE456B934'});  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24  'Content-Type': 'application/json',  
25  'Appid': appId,  
26  'Sign': sign,  
27  'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();

req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.addrIsValid | Boolean | `true`:valid address `false`:invalid address |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5    "addrIsValid": true  
6  }  
7}  
**Get Withdrawal Network Fee**

This endpoint retrieves withdrawal network fee for the given token.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getWithdrawFee

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |
| chain | String | Yes | Symbol of the chain |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getWithdrawFee';  
8const args \= JSON.stringify({ 'coinId': 1280 ,'chain':'POLYGON'});  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24  'Content-Type': 'application/json',  
25  'Appid': appId,  
26  'Sign': sign,  
27  'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.fee | Object |  |
| data.fee.coinId | Integer | Coin ID of the network fee |
| data.fee.coinSymbol | String | Network fee symbol |
| data.fee.amount | String | Amount of network fee |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5    "fee": {  
6      "coinId": 1329,  
7      "coinSymbol": "MATIC",  
8      "amount": "0.0213814"  
9    }  
10  }  
11  }  
**Get Fiat List**

This endpoint retrieves the list of fiat information

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getFiatList

Parameters

| Parameters | Type | Required | Description |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| No parameters required |  |  |  |  |  |  |  |  |  |  |  |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getFiatList';  
8const args \= '';  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24  'Content-Type': 'application/json',  
25  'Appid': appId,  
26  'Sign': sign,  
27  'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.fiats | Array |  |
| data.fiats\[index\].fiatId | Integer | Fiat ID |
| data.fiats\[index\].symbol | String | Fiat symbol |
| data.fiats\[index\].logoUrl | String | Fiat logo URL |
| data.fiats\[index\].mark | String | Fiat icon |
| data.fiats\[index\].usdRate | String | Equivalent fiat value of 1 USD |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5    "fiats": \[  
6      {  
7        "fiatId": 1022,  
8        "symbol": "DKK",  
9        "logoUrl": "https://resource.cwallet.com/fiat/DKK.png",  
10        "mark": "KR",  
11        "usdRate": "6.825765"  
12      },  
13      ...  
14    \]  
15  }  
16  }  
**Get Swap Coin List**

This endpoint retrieves the list of all coins available for swap.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getSwapCoinList

Parameters

| Parameters | Type | Required | Description |  |  |  |  |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| No parameters required |  |  |  |  |  |  |  |  |  |  |  |

| No parameters required |  |  |  |  |  |  |  |  |  |  |  |
| :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \= '\*\*\* your appId \*\*\*';  
5const appSecret \= '\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getSwapCoinList';  
8const args \= '';  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac('sha256', appSecret)  
18  .update(signText)  
19  .digest('hex');  
20  
21const options \= {  
22  method: 'POST',  
23  headers: {  
24    'Content-Type': 'application/json',  
25    'AppId': appId,  
26    'Sign': sign,  
27    'Timestamp': timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= '';  
33  
34  res.on('data', (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on('end', () \=\> {  
39    console.log('Response:', respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.coins | Array |  |
| data.coins\[index\].coinId | Integer | Coin ID |
| data.coins\[index\].symbol | String | Coin symbol |
| data.coins\[index\].logoUrl | String | Coin logo |

**Get Chain List**

This endpoint retrieves the current network statuses for all supported chains. Pass chain symbols to check specific network statuses.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getChainList

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| chains | Array | No | Chain symbol. For example, 'chains': \['BSC'\] |

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= 'https://ccpayment.com/ccpayment/v2/getChainList';  
8const args \= JSON.stringify({ 'chains': \['ETH','POLYGON'\]});;  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24  'Content-Type': 'application/json',  
25  'Appid': appId,  
26  'Sign': sign,  
27  'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.chains | Array |  |
| data.chains\[index\].chain | String | Chain symbol. For example, chain: 'BSC' |
| data.chains\[index\].chainFullName | String | Full name of the chain |
| data.chains\[index\].explorer | String | Blockchain explorer URL |
| data.chains\[index\].baseUrl | String | The base URL serves as the prefix for the on-chain transaction query URL.  Usage: To retrieve transaction details, append the transaction ID (txid) to this base URL to construct a full on-chain transaction query URL. |
| data.chains\[index\].isEVM | Boolean | `True`: The chain is EVM-compatible. `False`: The chain is not EVM-compatible. |
| data.chains\[index\].supportMemo | Boolean | `True`:  Memo/tag is **required** when using addresses on this chain. `False`:  Memo/tag is **not required** for addresses on this chain.  |
| data.chains\[index\].logoUrl | String | Coin logo |
| data.chains\[index\].status | String | Normal: Deposits and withdrawals through this chain are operating normally. Maintenance: Deposits and withdrawals may experience delays, or transactions on this network cannot be processed at this moment. |

Response

1{  
2    'code': 10000,  
3    'msg': 'success',  
4    'data': {  
5        'chains': \[  
6            {  
7                'chain': 'ETH',  
8                'chainFullName': 'Ethereum',  
9                'explorer': 'https://etherscan.io/',  
10                'logoUrl': 'https://resource.cwallet.com/token/icon/ETH.png',  
11                'status': 'Normal',  
12                'baseUrl': 'https://etherscan.io/tx/%s',  
13                'isEVM': True,  
14                'supportMemo': False  
15            },  
16            {  
17                'chain': 'POLYGON',  
18                'chainFullName': 'Polygon',  
19                'explorer': 'https://polygonscan.com',  
20                'logoUrl': 'https://resource.cwallet.com/token/icon/matic.png',  
21                'status': 'Normal',  
22                'baseUrl': 'https://polygonscan.com/tx/%s',  
23                'isEVM': True,  
24                'supportMemo': False  
25            }  
26        \]  
27    }  
28}  
**Balance Query APIs**

Get Balance List

This endpoint retrieves all balance in the merchant account

HTTP Request

POST[https://ccpayment.com/ccpayment/v2/getAppCoinAssetList](https://ccpayment.com/ccpayment/v2/getAppCoinAssetList)

Request Example

1const https \= require("https");

2const crypto \= require("crypto");

3

4const appId \= "\*\*\* your appId \*\*\*";

5const appSecret \= "\*\*\* your appSecret \*\*\*";

6

7const path \= "https://ccpayment.com/ccpayment/v2/getAppCoinAssetList";

8const args \= "";

9

10const timestamp \= Math.floor(Date.now() / 1000);

11let signText \= appId \+ timestamp;

12if (args) {

13  signText \+= args;

14}

15

16const sign \= crypto

17  .createHmac("sha256", appSecret)

18  .update(signText)

19  .digest("hex");

20

21const options \= {

22  method: "POST",

23  headers: {

24    "Content-Type": "application/json",

25    "Appid": appId,

26    "Sign": sign,

27    "Timestamp": timestamp.toString(),

28  },

29};

30

31const req \= https.request(path, options, (res) \=\> {

32  let respData \= "";

33

34  res.on("data", (chunk) \=\> {

35    respData \+= chunk;

36  });

37

38  res.on("end", () \=\> {

39    console.log("Response:", respData);

40  });

41});

42

43req.write(args);

44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.assets | Array | Balance list |
| data.assets\[index\].coinId | Integer | Coin ID |
| data.assets\[index\].coinSymbol | String | Coin symbol |
| data.assets\[index\].available | String | available amount |

Response

1{

2    "code": 10000,

3    "msg": "success",

4    "data": {

5      "assets": \[

6        {

7          "coinId": 1864,

8          "coinSymbol": "SHIB",

9          "available": ""

10        },

11        ...

12      \]

13    }

14  }  
**Get Coin Balance**

This endpoint retrieves the balance of one provided coin

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppCoinAsset

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |

Response

1{

2    "code": 10000,

3    "msg": "success",

4    "data": {

5      "assets": \[

6        {

7          "coinId": 1864,

8          "coinSymbol": "SHIB",

9          "available": ""

10        },

11        ...

12      \]

13    }

14  }

     \]

13    }

14  }  
**Get Coin Balance**

This endpoint retrieves the balance of one provided coin

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppCoinAsset

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |

Request Example

1const https \= require("https");

2const crypto \= require("crypto");

3

4const appId \= "\*\*\* your appId \*\*\*";

5const appSecret \= "\*\*\* your appSecret \*\*\*";

6

7const path \= "https://ccpayment.com/ccpayment/v2/getAppCoinAsset";

8const args \= JSON.stringify({

9  "coinId": 1280,

10});

11

12const timestamp \= Math.floor(Date.now() / 1000);

13let signText \= appId \+ timestamp;

14if (args.length \!== 0) {

15  signText \+= args;

16}

17

18const sign \= crypto

19  .createHmac("sha256", appSecret)

20  .update(signText)

21  .digest("hex");

22

23const options \= {

24  method: "POST",

25  headers: {

26    "Content-Type": "application/json",

27    "Appid": appId,

28    "Sign": sign,

29    "Timestamp": timestamp.toString(),

30  },

31};

32

33const req \= https.request(path, options, (res) \=\> {

34  let respData \= "";

35

36  res.on("data", (chunk) \=\> {

37    respData \+= chunk;

38  });

39

40  res.on("end", () \=\> {

41    console.log("Response:", respData);

42  });

43});

44

45req.write(args);

46req.end();

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.asset | Object | Balance list |
| data.asset.coinId | Integer | Coin ID |
| data.asset.coinSymbol | String | Coin symbol |
| data.asset.available | String | available amount |

Response

1{

2    "code": 10000,

3    "msg": "success",

4    "data": {

5      "asset": {

6        "coinId": 1329,

7        "coinSymbol": "MATIC",

8        "available": ""

9      }

10    }

11  }  
**Deposit APIs**

Create Deposit Address for Order

This endpoint creates a deposit address for one order.

Merchants will receive Webhook notification for every payment made to this address. This type of deposit is "API Deposit".

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/createAppOrderDepositAddress

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID of the coin to pay |
| fiatId | Integer | No | If `fiatId` has a value, the price for the product will be the provided fiat.  CCPayment will convert the fiat value to coin amount and generate the address based on the provided coinID.Retrieve `fiatId` by  [calling fiat list interface](https://ccpayment.com/api/doc?en#get-fiat-list). |
| price | String | Yes | Product price, it can be fiat or cryptocurrency. If you pass `fiatId`, price will be fiat. If `fiatId` is left empty, the price will be the same as the coin to pay.  |
| chain | String | Yes | Symbol of the chain |
| orderId | String | Yes | Order ID, 3-64 characters in length |
| expiredAt | Integer | No | A 10-digit timestamp. Order will expire at this time. Default value is 10 days.  Example: If Order is only valid for 30 mins.  expiredAt \= Timestamp of creation \+ 60\*30 Before the expiration time, **the rate will be locked**. Crypto market is very volatile. We recommend you to lock the rate for a relatively short period to prevent potential loss. After the expiration time, your account will still receive all payments to the deposit address within 7 days. |
| buyerEmail | String | No | CCPayment will send order and payment information to the provided mail address. CCPayment will not use the provided mail addresses for other purposes. |
| generateCheckoutURL | Boolean | No | `true`: Create a checkout URL for this order `false`: (default) Do not create checkout URL  |
| product | String | No | The product name will be displayed on the checkout page. This parameter is only valid when a checkout URL has been created. It cannot exceed 120 characters. |
| returnUrl | String | No | The next URL after successful payment. It will be displayed on the checkout page and is only valid when a checkout URL has been created. |

Request Example

1const https \= require("https");

2const crypto \= require("crypto");

3

4const appId \= "\*\*\* your appId \*\*\*";

5const appSecret \= "\*\*\* your appSecret \*\*\*";

6

7const path \= "https://ccpayment.com/ccpayment/v2/createAppOrderDepositAddress";

8const args \= JSON.stringify({

9  "coinId": 1280,

10  "price": "1",

11  "orderId": "testorderid1111",

12  "chain": "POLYGON",

13});

14

15const timestamp \= Math.floor(Date.now() / 1000);

16let signText \= appId \+ timestamp;

17if (args.length \!== 0) {

18  signText \+= args;

19}

20

21const sign \= crypto

22  .createHmac("sha256", appSecret)

23  .update(signText)

24  .digest("hex");

25

26const options \= {

27  method: "POST",

28  headers: {

29    "Content-Type": "application/json",

30    "Appid": appId,

31    "Sign": sign,

32    "Timestamp": timestamp.toString(),

33  },

34};

35

36const req \= https.request(path, options, (res) \=\> {

37  let respData \= "";

38

39  res.on("data", (chunk) \=\> {

40    respData \+= chunk;

41  });

42

43  res.on("end", () \=\> {

44    console.log("Response:", respData);

45  });

46});

47

48req.write(args);

49req.end();  
Response

1{

2    "code": 10000,

3    "msg": "success",

4    "data": {

5      "address": "0x9aBDDCE1EE18D1857C0653EB4a3Fa9d9E0dcd584",

6      "amount": "0.008552856654122477",

7      "memo": "",

8      "checkoutUrl": "https://i.ccpayment.com/xxx",

9      "confirmsNeeded": 50 

 10    }

11  }  
   "data": {

5      "address": "0x9aBDDCE1EE18D1857C0653EB4a3Fa9d9E0dcd584",

6      "amount": "0.008552856654122477",

7      "memo": "",

8      "checkoutUrl": "https://i.ccpayment.com/xxx",

9      "confirmsNeeded": 50 

 10    }

11  }  
Webhook for API Deposit

After receiving a webhook, the merchant's server should call the [Get Order Information](https://ccpayment.com/api/doc?en#get-order-information) API to confirm the order and payment information.

Webhook Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| type | String | Type: ApiDeposit |
| msg | Object |  |
| msg.recordId | String | CCPayment unique ID for a transaction |
| msg.orderId | String | Your unique ID for the order |
| msg.coinId | Integer | Coin ID |
| msg.coinSymbol | String | Coin symbol |
| msg.status | String | `Success`: the transaction has been confirmed; `Processing`: blockchain is processing the transaction; |
| msg.isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |

**Note:** If a payment is flagged as risky, CCPayment will not automatically credit the amount to your CCPayment account. We strongly recommend **not automatically crediting risky payments** to your users' accounts. After processing the payment, you can choose to either credit the user or refund the payment manually.

Request Example

1{

2  "type": "ApiDeposit",

3  "msg": {

4    "recordId": "20240313121919...",

5    "orderId": "202403131218361...",

6    "coinId": 1329,

7    "coinSymbol": "POL",

8    "status": "Success",

9    "isFlaggedAsRisky": false

10  }

11}  
Get Order Information

This endpoint retrieves order information and all deposit records associated with the provided Order ID. Use case: if there are multiple payments under one order, you can obtain all the deposit records associated with that specific order by passing the order ID. And based on the information returned to determine whether the payment for this order is partially paid, overpaid, underpaid, or overdue payment.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppOrderInfo

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| orderId | String | Yes | 3 \- 64 characters in length. Unique ID for the order in your system. |

Request Example

1const https \= require("https");

2const crypto \= require("crypto");

3

4const appId \= "\*\*\* your appId \*\*\*";

5const appSecret \= "\*\*\* your appSecret \*\*\*";

6const orderId \= "your\_order\_id";

7

8const path \= "https://ccpayment.com/ccpayment/v2/getAppOrderInfo";

9const args \= JSON.stringify({

10  "orderId":"1709889675"

11});

12

13const timestamp \= Math.floor(Date.now() / 1000);

14let signText \= appId \+ timestamp;

15if (args.length \!== 0) {

16  signText \+= args;

17}

18

19const sign \= crypto

20  .createHmac("sha256", appSecret)

21  .update(signText)

22  .digest("hex");

23

24const options \= {

25  method: "POST",

26  headers: {

27    "Content-Type": "application/json",

28    "Appid": appId,

29    "Sign": sign,

30    "Timestamp": timestamp.toString(),

31  },

32};

33

34const req \= https.request(path, options, (res) \=\> {

35  let respData \= "";

36

37  res.on("data", (chunk) \=\> {

38    respData \+= chunk;

39  });

40

41  res.on("end", () \=\> {

42    console.log("Response:", respData);

43  });

44});

45

46req.write(args);

47req.end();  
Response Parameters

 method: "POST",

26  headers: {

27    "Content-Type": "application/json",

28    "Appid": appId,

29    "Sign": sign,

30    "Timestamp": timestamp.toString(),

31  },

32};

33

34const req \= https.request(path, options, (res) \=\> {

35  let respData \= "";

36

37  res.on("data", (chunk) \=\> {

38    respData \+= chunk;

39  });

40

41  res.on("end", () \=\> {

42    console.log("Response:", respData);

43  });

44});

45

46req.write(args);

47req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.amountToPay | String | Coin amount to pay |
| data.coinId | Integer | The deposit coin ID specified by the order. |
| data.coinSymbol | String | The deposit coin symbol specified by the order. |
| data.chain | String | The deposit chain symbol specified by the order. |
| data.toAddress | String | Deposit address. Your account can still receive the deposit and the webhook for 7 days after the expiration time. Payments after the expiration time will be credited into your account with an "Overdue" status on the dashboard. |
| data.toMemo | String | For memo-required coins (such as XRP, XLM, etc.), the payer must fill in the correct memo to initiate the payment. |
| data.fiatId | Integer | Fiat price. This parameter will be included in the response if the order has a fiat price. |
| data.fiatSymbol | String | Fiat symbol. This parameter will be included in the response if the order has a fiat price. |
| data.rate | String | If the order has a fiat price, we will convert it to the coin amount to pay based on the current rate. The rate will be included in the response if the order has a fiat price. amountToPay=price/rate |
| data.createAt | Integer | Order creation timestamp, 10-digit |
| data.expiredAt | Integer | Order expiration time: Timestamp in seconds (10 digits). Default validity 24 hours without timestamp. The maximum validity 10 days.  Before the expiration time, **the rate will be locked**.  After the expiration time, your account will still receive all payments to the deposit address within 7 days. |
| data.checkoutUrl | String | Will only be returned when a checkout URL has been created. The payer will pay on this page. |
| data.buyerEmail | String | CCPayment will send order and payment information to the provided mail address. |
| data.paidList | Array | List of payments for this order. Note: If the coin used for payment differs from the pre-determined coin to pay, it will not be included in this payment list. For example, the pre-determined payment coin is ETH. A MATIC payment for this order will not be included in this payment list. |
| data.paidList\[index\].recordId | String | CCPayment unique ID for a transaction |
| data.paidList\[index\].fromAddress | String | From address, if the transaction is a UTXO type, no address will be returned. |
| data.paidList\[index\].amount | String | Received amount |
| data.paidList\[index\].serviceFee | String | Service fee |
| data.paidList\[index\].txid | String | TXID |
| data.paidList\[index\].status | String | `Success`: the transaction has been confirmed `Processing`: blockchain is processing the transaction `Failed`: transaction failed |
| data.paidList\[index\].isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |
| data.paidList\[index\].arrivedAt | Integer | Deposit arrived timestamp |
| data.paidList\[index\].rate | String | The rate at the time of receipt. If the payment is received before the expiration time of the order, the rate will remain as the rate locked at the time of order creation. If the payment is received after the expiration time of the order, the rate will be the rate at the time of receipt. Paid fiat value \= coin amount \* rate The rate will be included in the response if the order has a fiat price. |

Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5      "amountToPay": "0.008552856654122477",  
6      "coinId": 1329,  
7      "coinSymbol": "MATIC",  
8      "chain": "POLYGON",  
9      "toAddress": "0x9abddce1ee18d1857c0653eb4a3fa9d9e0dcd584",  
10      "createAt": 1710233933,  
11      "rate": "1.1692",  
12      "fiatId": 1033,  
13      "fiatSymbol": "USD",  
14      "expiredAt": 1710243931,  
15      "checkoutUrl": "https://i.ccpayment.com/1djqz1m",  
16      "paidList": \[  
17        {  
18          "recordId": "20240312090316119190942031876096",  
19          "fromAddress": "0x12438f04093ebc87f0ba629bbe93f2451711d967",  
20          "amount": "0.001",  
21          "serviceFee": "0.0000005",  
22          "txid": "0xef4abf7175cefbe2f06002a959892e4b407bef02175980eaa9bb1967fcba1b22",  
23          "status": "Success",  
24          "arrivedAt": 1710234197,  
25          "rate": "1.1692"  
26        }  
27      \]  
28    }   
 29  }

**Invoice API**

This endpoint retrieves a payment URL that allows the user to select the desired cryptocurrency and network to complete the payment.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/createInvoiceUrl

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| orderId | String | Yes | Order ID created by merchant. 3-64 characters in length. |
| product | String | No | Product name that will be displayed on the payment page. Must be less than 120 characters. |
| returnUrl | String | Yes | URL to which the user will be redirected after completing the payment. Must be a valid URL format. |
| price | String | Yes | The price of the product, which can be specified as either a fiat amount or a cryptocurrency amount. |
| priceFiatId | String | No | ID for the fiat currency in which the price is denominated. Get fiat ID by [calling Get Fiat List](https://ccpayment.com/api/doc?en#get-fiat-list) interface. |
| priceCoinId | String | No | ID for the cryptocurrency in which the price is denominated. Get coin ID by [calling Get Token List](https://ccpayment.com/api/doc?en#get-token-list) interface. |
| expiredAt | Integer | No | A 10-digit timestamp. Payment URL will expire at this time. Default value is 24 hours.  Example: If URL is only valid for 30 mins. expiredAt \= Timestamp of creation \+ 60\*30 |
| buyerEmail | String | No | Email address of the buyer to receive payment confirmation and other transaction-related information. |

Pass either `priceFiatId` or `priceCoinId` as the denominating currency. Do not pass both.  
Request Example

1const crypto \= require('crypto');  
2const axios \= require('axios');  
3  
4*// Configuration variables*  
5const appID \= "\*\*\* your app\_id \*\*\*";  
6const appSecret \= "\*\*\* your app\_secret \*\*\*";  
7const url \= "https://ccpayment.com/ccpayment/v2/createInvoiceUrl";  
8  
9*// Build request body*  
10const content \= {  
11    orderId: String(Math.floor(Date.now() / 1000)), *// Current timestamp in seconds*  
12    price: "1",  
13    priceCoinId: "1280",  
14    *// Optional fields*  
15    *// priceFiatId: "1033",*  
16    *// product: "test",*  
17    *// returnUrl: "",*  
18    *// buyerEmail: "",*  
19    *// expiredAt: ""*  
20};  
21  
22*// Get the current timestamp (in seconds)*  
23const timestamp \= Math.floor(Date.now() / 1000);  
24  
25*// Convert the content object to a JSON string*  
26let body \= JSON.stringify(content);  
27  
28*// Create the signature base string*  
29let signText \= appID \+ timestamp;  
30if (body.length \!== 2) { *// Check if the body is an empty object*  
31    signText \+= body;  
32} else {  
33    body \= "";  
34}  
35  
36*// Generate HMAC SHA256 signature*  
37function generateHMACSHA256(data, secret) {  
38    return crypto.createHmac('sha256', secret).update(data).digest('hex');  
39}  
40  
41const serverSign \= generateHMACSHA256(signText, appSecret);  
42  
43*// Set HTTP request headers*  
44const headers \= {  
45    'Content-Type': 'application/json;charset=utf-8',  
46    'Appid': appID,  
47    'Sign': serverSign,  
48    'Timestamp': timestamp  
49};  
50  
51*// Send the HTTP POST request*  
52axios.post(url, body, { headers })  
53    .then(response \=\> {  
54        console.log("Response:", response.data);  
55    })  
56    .catch(error \=\> {  
57        console.error("Error making request:", error.message);  
58    });  
59

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.invoiceUrl | String | Invoice payment URL |

Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5        "invoiceUrl": "https://i.ccpayment.com/xxx"  
6    }  
7}

**Webhook for Invoice API Deposit**

After receiving a webhook, the merchant's server should call the [Get Deposit Record](https://ccpayment.com/api/doc?en#get-invoice-order-information) endpoint to confirm the deposit information.

Webhook Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| type | String | Type: ApiDeposit |
| msg | Object |  |
| msg.recordId | String | CCPayment unique ID for a transaction |
| msg.orderId | String | Your unique ID for the order. One order ID may have multiple record IDs if there are multiple payments for one order. |
| msg.coinId | Integer | Coin ID |
| msg.coinSymbol | String | Coin symbol |
| msg.status | String | `Success`: the transaction has been confirmed; `Processing`: blockchain is processing the transaction; |
| msg.isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |

**Note:** If a payment is flagged as risky, CCPayment will not automatically credit the amount to your CCPayment account. We strongly recommend **not automatically crediting risky payments** to your users' accounts. After processing the payment, you can choose to either credit the user or refund the payment manually.  
Request Example

1{  
2  "type": "ApiDeposit",  
3  "msg": {  
4    "recordId": "20240919035020188328269786624000",  
5    "orderId": "1726717497",  
6    "coinId": 2541,  
7    "coinSymbol": "POL",  
8    "status": "Success",  
9    "isFlaggedAsRisky": false,  
10  }  
11}

**Get Invoice Order Information**

This endpoint retrieves invoice order information and all deposit records associated with the provided Order ID. Use case: if there are multiple payments under one order, you can obtain all the deposit records associated with that specific order by passing the order ID. And based on the information returned to determine whether the payment for this order is partially paid, overpaid, underpaid, or overdue payment.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getInvoiceOrderInfo

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| orderId | String | Yes | 3 \- 64 characters in length. Unique ID for the order. |

Request Example

1const crypto \= require('crypto');  
2const axios \= require('axios');  
3  
4*// Configuration variables*  
5const appID \= "\*\*\* your app\_id \*\*\*";  
6const appSecret \= "\*\*\* your app\_secret \*\*\*";  
7const url \= "https://ccpayment.com/ccpayment/v2/getInvoiceOrderInfo";  
8  
9*// Build request body*  
10const content \= {  
11    orderId: "xxxxxxxx",  
12};  
13  
14*// Get the current timestamp (in seconds)*  
15const timestamp \= Math.floor(Date.now() / 1000);  
16  
17*// Convert the content object to a JSON string*  
18let body \= JSON.stringify(content);  
19  
20*// Create the signature base string*  
21let signText \= appID \+ timestamp;  
22if (body.length \!== 2) { *// Check if the body is an empty object*  
23    signText \+= body;  
24} else {  
25    body \= "";  
26}  
27  
28*// Generate HMAC SHA256 signature*  
29function generateHMACSHA256(data, secret) {  
30    return crypto.createHmac('sha256', secret).update(data).digest('hex');  
31}  
32  
33const serverSign \= generateHMACSHA256(signText, appSecret);  
34  
35*// Set HTTP request headers*  
36const headers \= {  
37    'Content-Type': 'application/json;charset=utf-8',  
38    'Appid': appID,  
39    'Sign': serverSign,  
40    'Timestamp': timestamp  
41};  
42  
43*// Send the HTTP POST request*  
44axios.post(url, body, { headers })  
45    .then(response \=\> {  
46        console.log("Response:", response.data);  
47    })  
48    .catch(error \=\> {  
49        console.error("Error making request:", error.message);  
50    });  
51

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.orderId | String | Order ID created by merchant |
| data.createAt | Integer | Order creation timestamp, 10-digit |
| data.product | String | Product Name. Included only if a valid value is provided. |
| data.price | String | Product price |
| data.priceFiatId | Integer | Fiat price. This parameter is included in the response if the invoice is denominated in fiat currency. |
| data.priceCoinId | String | Coin amount to pay. This parameter is included in the response if the invoice is denominated in cryptocurrency. |
| data.priceSymbol | String | Symbol of the denominated currency. Example: 'BTC' for Bitcoin or 'EUR' for Euro. |
| data.invoiceUrl | String | Invoice payment URL |
| data.expiredAt | Integer | A 10-digit timestamp. Payment URL will expire at this time. Default value is 24 hours. Example: If URL is valid for 30 mins.  expiredAt \= Timestamp of creation \+ 60\*30 |
| data.totalPaidValue | String | Total amount paid for this order in the denominated currency |
| data.buyerEmail | String | CCPayment will send order and payment information to the provided mail address. |
| data.paidList | Array | List of payments associated with this order |
| data.paidList\[index\].recordId | String | CCPayment unique ID for a transaction |
| data.paidList\[index\].coinId | Integer | Payment coin ID |
| data.paidList\[index\].coinSymbol | String | Payment coin symbol |
| data.paidList\[index\].paidAmount | String | Paid coin amount |
| data.paidList\[index\].serviceFee | String | Service fee |
| data.paidList\[index\].rate | String | The rate at the time of receipt, calculated as: Payment coin's USD value / Denominated currency's USD value |
| data.paidList\[index\].paidValue | String | Paid amount denominated value: Paid value \= paid amount \* rate |
| data.paidList\[index\].chain | String | Chain symbol |
| data.paidList\[index\].fromAddress | String | From address, if the transaction is a UTXO type, no address will be returned. |
| data.paidList\[index\].toAddress | String | Receiving address for the selected coin. Payments made after 7 days past the order's expiration will still be credited to the merchant and labeled as overdue payment. |
| data.paidList\[index\].toMemo | String | Memo for memo-required coins (such as XRP, XLM, TON, etc.) |
| data.paidList\[index\].txid | String | TXID |
| data.paidList\[index\].status | String | `Success`: the transaction has been confirmed `Processing`: blockchain is processing the transaction `Failed`: transaction failed  |
| data.paidList\[index\].isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |
| data.paidList\[index\].arrivedAt | String | Deposit arrived timestamp |

Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5        "orderId": "172707....",  
6        "createAt": 1727074590,  
7        "product": "test",  
8        "price": "1",  
9        "priceCoinId": 1280,  
10        "priceSymbol": "USDT",  
11        "invoiceUrl": "https://i.ccpayment.com/xxxxx",  
12        "buyerEmail": "CCPaymentOfficial@proton.me",  
13        "expiredAt": 1727160989,  
14        "totalPaidValue": "1.022400000000000008",  
15        "paidList": \[  
16            {  
17                "recordId": "2024092306573418982494067xxxxx",  
18                "coinId": 1280,  
19                "coinSymbol": "USDT",  
20                "chain": "BSC",  
21                "fromAddress": "0x4766dc5207f5172c05da8d4f1dxxxxxxx",  
22                "toAddress": "0xc53be3a4c137098200aa508dcfe6axxxxxxx",  
23                "toMemo": "",  
24                "paidAmount": "0.5",  
25                "serviceFee": "0.0025",  
26                "txid": "0xf227c25d124317a4b80094c0d55f5f248082636dbf3fca21fea3bxxxxxxxx",  
27                "status": "Success",  
28                "isFlaggedAsRisky": false,  
29                "arrivedAt": 1727074654,  
30                "rate": "1",  
31                "paidValue": "0.5"  
32            },  
33            {  
34                "recordId": "20240923070723189827xxxxxxxxx",  
35                "coinId": 1340,  
36                "coinSymbol": "CELO",  
37                "chain": "CELO",  
38                "fromAddress": "0x4766dc5207f5172c05da8d4f1d6659xxxxxxxx",  
39                "toAddress": "0xc53be3a4c137098200aa508dcfe6a02axxxxxxxx",  
40                "toMemo": "",  
41                "paidAmount": "1",  
42                "serviceFee": "0.005",  
43                "txid": "0xba302c48b2169f4b853c98d0e618276fa5f93acd54b1f23a8b64310xxxxxxx",  
44                "status": "Success",  
45                "isFlaggedAsRisky": false,  
46                "arrivedAt": 1727075243,  
47                "rate": "1.9142419601837672",  
48                "paidValue": "0.522400000000000008"  
49            }  
50        \]  
51    }  
52}  
**Get Permanent Deposit Address**

When you make a request to this endpoint with a `referenceId` and `chain` specified, CCPayment first checks to see if there is an existing permanent address associated with the given reference ID.

Address Handling:

* Existing Address: If a permanent address is already linked to the reference ID, CCPayment will return this address in the response.  
* New Address: If no address is linked to the reference ID, CCPayment will generate a new deposit address for that reference ID on the specified blockchain network and return this new address.

Each APP ID can obtain 1000 addresses via this interface. If you need more addresses, please [contact customer service](https://t.me/CCPaymentSupportBot) for help.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getOrCreateAppDepositAddress

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| referenceId | String | Yes | 3 \- 64 characters in length. Unique reference ID for the user in your system. |
| chain | String | Yes | Symbol of the chain. Call [Get Token Information](https://ccpayment.com/api/doc?en#get-token-information) the API and use **data.coin\[index\].networks\[chain\].chain** to get the chain symbol. Example:'chain': 'TRX' |

Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/getOrCreateAppDepositAddress";  
8const args \= JSON.stringify({  
9  "referenceId": String(Math.floor(Date.now() / 1000)),  
 10  "chain": "POLYGON",   
 11});  
12  
13const timestamp \= Math.floor(Date.now() / 1000);  
14let signText \= appId \+ timestamp;  
15if (args.length \!== 0) {  
16  signText \+= args;  
17}  
18  
19const sign \= crypto  
20  .createHmac("sha256", appSecret)  
21  .update(signText)  
22  .digest("hex");  
23  
24const options \= {  
25  method: "POST",  
26  headers: {  
27    "Content-Type": "application/json",  
28    "Appid": appId,  
29    "Sign": sign,  
30    "Timestamp": timestamp.toString(),  
31  },  
32};  
33  
34const req \= https.request(path, options, (res) \=\> {  
35  let respData \= "";  
36  
37  res.on("data", (chunk) \=\> {  
38    respData \+= chunk;  
39  });  
40  
41  res.on("end", () \=\> {  
42    console.log("Response:", respData);  
43  });  
44});  
45  
46req.write(args);  
47req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.address | String | Permanent deposit address |
| data.memo | String | For memo-required coins (such as XRP, XLM, etc.), the payer must fill in the correct memo to initiate the payment. |

Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5    "address": "0x7C631947c139F0163fECc0eef39f251D72dAE3B8",  
6    "memo": ""  
7  }  
8}

Webhook for Direct Deposit

After receiving a webhook, the merchant's server should call the [Get Deposit Record](https://ccpayment.com/api/doc?en#get-deposit-record) API to confirm the deposit information.

Webhook Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| type | String | Type: DirectDeposit |
| msg | Object |  |
| msg.recordId | String | CCPayment unique ID for a transaction |
| msg.referenceId | String | Your unique reference ID for the user |
| msg.coinId | Integer | Coin ID |
| msg.coinSymbol | String | Coin symbol |
| msg.status | String | `Success`: the transaction has been confirmed; `Processing`: blockchain is processing the transaction; |
| msg.isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |

**Note:** If a payment is flagged as risky, CCPayment will not automatically credit the amount to your CCPayment account. We strongly recommend **not automatically crediting risky payments** to your users' accounts. After processing the payment, you can choose to either credit the user or refund the payment manually.  
Request Example

1{  
2  "type": "DirectDeposit",  
3  "msg": {  
4    "recordId": "2024031311310811...",  
5    "referenceId": "63224704901...",  
6    "coinId": 1329,  
7    "coinSymbol": "MATIC",  
8    "status": "Success",  
9    "isFlaggedAsRisky":false  
10  }  
11}  
**Webhook for Risky Address**

Risky addresses are immediately disabled. CCPayment will send a webhook notification to your server when an address has been flagged as risky. Deposits to flagged addresses will not trigger automatic webhook notifications. However, you can manually send webhooks on your dashboard for those deposits.

Webhook Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| chainId | String | Chain ID |
| address | String | The receiving address flagged as risky |
| riskAt | Integer | Address flagged timestamp |

After receiving the webhook, promptly inform your clients to stop depositing to the flagged address and call the [Address Unbinding](https://ccpayment.com/api/doc?en#address-unbinding) API to unbind the address.  
**Address Unbinding**

This endpoint allows you to unbind a deposit address from a **userID/referenceID**.

Use case:

If a deposit address is flagged as risky, unbinding it helps prevent potential asset freezing by the network. Once unbound, you can obtain a new deposit address for the same **userID/referenceID** by calling the [Get Permanent Deposit Address](https://ccpayment.com/api/doc?en#get-permanent-deposit-address)/[Get a User Deposit Address](https://ccpayment.com/api/doc?en#user-deposit-api) API.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/addressUnbinding

Parameters

Request Example

1const https \= require('https');  
2const crypto \= require('crypto');  
3  
4const appId \='\*\*\* your appId \*\*\*';  
5const appSecret \='\*\*\* your appSecret \*\*\*';  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/addressUnbinding";  
8const args \= JSON.stringify({ 'chain': "POLYGON" ,'address':'0x3720C7f5b352E9da3A102B3b8c49080acAa4ceee'});  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args) {  
13signText \+= args;  
14}  
15  
16const sign \= crypto  
17.createHmac('sha256', appSecret)  
18.update(signText)  
19.digest('hex');  
20  
21const options \= {  
22method: 'POST',  
23headers: {  
24'Content-Type': 'application/json',  
25'Appid': appId,  
26'Sign': sign,  
27'Timestamp': timestamp.toString(),  
28},  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32let respData \= '';  
33  
34res.on('data', (chunk) \=\> {  
35respData \+= chunk;  
36});  
37  
38res.on('end', () \=\> {  
39console.log('Response:', respData);  
40});  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.userID | String | If the address was previously bound to a user ID, this parameter will be returned. |
| data.referenceID | String | If the address was previously bound with a referenceID, this parameter will be returned. |
| data.unbound | Array | Unbound address details, including `chain` and `address` |
| data.unbound\[index\].chain | String | The network for unbound address |
| data.unbound\[index\].address | String | Unbound address |
| data.unboundAt | Integer | Timestamp of the address unbinding operation |

If an address on an EVM-compatible blockchain (e.g., ETH, BSC, Polygon) is unbound, the corresponding deposit addresses on other EVM-compatible networks will also be automatically unbound.

After unbinding, payments sent to the unbound address can still be credited to your merchant account  
Response

1{  
2  "code": 10000,  
3  "msg": "success",  
4  "data": {  
5    "unbound": \[  
6      {  
7        "chain": "POLYGON",  
8        "address": "0xa9a363196b22c1760cc7B777C5dD6264C376F20a"  
9      }  
10    \],  
11    "unboundAt": 1741783734,  
12    "userID": "",  
13    "referenceID": "1735287108"  
14  }  
15}  
**Get Deposit Record**

This endpoint retrieves the detailed information of a specific record ID. This is a very crucial endpoint for you to get transaction details and confirm the status of the transaction. You will need the information returned by the interface to update transaction status and credit your user accordingly.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppDepositRecord

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| recordId | String | Yes | CCPayment unique ID for a transaction |

Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/getAppDepositRecord";  
8const args \= JSON.stringify({  
9  "recordId": "20250116073333231508600365121536"  
 10});  
11  
12const timestamp \= Math.floor(Date.now() / 1000);  
13let signText \= appId \+ timestamp;  
14if (args.length \!== 0) {  
15  signText \+= args;  
16}  
17  
18const sign \= crypto  
19  .createHmac("sha256", appSecret)  
20  .update(signText)  
21  .digest("hex");  
22  
23const options \= {  
24  method: "POST",  
25  headers: {  
26    "Content-Type": "application/json",  
27    "Appid": appId,  
28    "Sign": sign,  
29    "Timestamp": timestamp.toString(),  
30  },  
31};  
32  
33const req \= https.request(path, options, (res) \=\> {  
34  let respData \= "";  
35  
36  res.on("data", (chunk) \=\> {  
37    respData \+= chunk;  
38  });  
39  
40  res.on("end", () \=\> {  
41    console.log("Response:", respData);  
42  });  
43});  
44  
45req.write(args);  
46req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.record | Object |  |
| data.record.recordId | String | CCPayment unique ID for a transaction |
| data.record.coinId | Integer | Deposit Coin ID |
| data.record.coinSymbol | String | Deposit Coin symbol |
| data.record.chain | String | Symbol of the chain |
| data.reocrd.contract | String | Contract |
| data.record.coinUSDPrice | String | Coin price in USD at the time of payment receipt |
| data.record.fromAddress | String | From address, if the transaction is a UTXO type, this parameter will not be returned. |
| data.record.toAddress | String | Destination address |
| data.record.toMemo | String | Memo of the address |
| data.record.amount | String | Received amount |
| data.record.serviceFee | String | Service fee |
| data.record.txId | String | TXID |
| data.record.status | String | `Success`: the transaction has been confirmed `Processing`: blockchain is processing the transaction `Failed`: transaction failed |
| data.record.isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |
| data.record.arrivedAt | Integer | Deposit arrived timestamp |
| data.record.referenceId | String | Reference ID will only be returned if the payment has a linked reference ID |
| data.record.orderId | String | Order ID will only be returned if the payment has a linked order ID |

In UTXO-type transactions, the `fromAddress` will not be returned. The actual sender address is among a variety of input addresses. Please confirm with the payer of the transaction to obtain the sender address.

Response

1{  
2'code': 10000,  
3'msg': 'success',  
4'data': {  
5  'record': {  
6    'recordId': '20250116073333231508600365121536',  
7    'orderId': '1737011983',  
8    'coinId': 1482,  
9    'coinSymbol': 'TRX',  
10    'chain': 'TRX',  
11    'contract': 'TRX',  
12    'coinUSDPrice': '0.23717',  
13    'fromAddress': 'TRPKg7eGMy9aZS2RumSPeWoyVkDqTVwLgL',  
14    'toAddress': 'TAkmn3f8bgwMAwdVrGfUVSRg4W2XwqgHGc',  
15    'toMemo': '',  
16    'amount': '0.5',  
17    'serviceFee': '0.0025',  
18    'txId': 'f39abf3275607fe2ffd40c06adf877f249829f6d1146a4f72ca2ad79ed7ed072',  
19    'status': 'Success',  
20    'arrivedAt': 1737012813,  
21    'isFlaggedAsRisky': False  
22    }  
23  }  
24}  
**Get Deposit Record List**

Get a list of deposits records within a specific time range. Deposit records are sorted by creation time in descending order.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppDepositRecordList

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | No | Coin ID |
| referenceId | String | No | 3 \- 64 characters in length. Unique reference ID for the user in your system. |
| orderId | String | No | Order ID, 3-64 characters in length. Do not pass both order ID and reference ID in the same request. |
| chain | String | No | Symbol of the chain |
| startAt | Integer | No | Retrieve all transaction records starting from the specified `startAt` timestamp. |
| endAt | Integer | No | Retrieve all transaction records up to the specified `endAt` timestamp. |
| nextId | String | No | Next ID |

If the query result exceeds 20 records, a "nextId" field will be returned.

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.

Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/getAppDepositRecordList";  
8const args \= "";  
9  
10const timestamp \= Math.floor(Date.now() / 1000);  
11let signText \= appId \+ timestamp;  
12if (args.length \!== 0) {  
13  signText \+= args;  
14}  
15  
16const sign \= crypto  
17  .createHmac("sha256", appSecret)  
18  .update(signText)  
19  .digest("hex");  
20  
21const options \= {  
22  method: "POST",  
23  headers: {  
24    "Content-Type": "application/json",  
25    "Appid": appId,  
26    "Sign": sign,  
27    "Timestamp": timestamp.toString(),  
28  },  
29};  
30  
31const req \= https.request(path, options, (res) \=\> {  
32  let respData \= "";  
33  
34  res.on("data", (chunk) \=\> {  
35    respData \+= chunk;  
36  });  
37  
38  res.on("end", () \=\> {  
39    console.log("Response:", respData);  
40  });  
41});  
42  
43req.write(args);  
44req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.records | Array |  |
| data.records\[index\].recordId | String | CCPayment unique ID for a transaction |
| data.records\[index\].coinId | Integer | Deposit Coin ID |
| data.records\[index\].coinSymbol | String | Deposit Coin symbol |
| data.records\[index\].chain | String | Symbol of the chain |
| data.record\[index\].contract | String | Contract |
| data.record\[index\].coinUSDPrice | String | Coin price in USD at the time of payment receipt |
| data.records\[index\].fromAddress | String | From address, if the transaction is a UTXO type, no address will be returned. |
| data.records\[index\].toAddress | String | Destination address |
| data.records\[index\].toMemo | String | Memo of the address |
| data.records\[index\].amount | String | Received amount |
| data.records\[index\].serviceFee | String | Service fee |
| data.records\[index\].txId | String | TXID |
| data.records\[index\].status | String | `Success`: the transaction has been confirmed `Processing`: blockchain is processing the transaction `Failed`: transaction failed |
| data.records\[index\].isFlaggedAsRisky | Boolean | `True`: The transaction is considered risky, and the amount will not be credited to the merchant's balance. Please process the amount in [Transaction \> Risky Transaction](https://console.ccpayment.com/transaction/list/risk-list) on the merchant dashboard. `False`: The transaction is not considered risky. |
| data.records\[index\].arrivedAt | Integer | Deposit arrived timestamp |
| data.records\[index\].referenceId | String | Reference ID will only be returned if the payment has a linked reference ID |
| data.records\[index\].orderId | String | Order ID will only be returned if the payment has a linked order ID |
| data.nextId | String | If the query result exceeds 20 records, a "nextId" field will be returned.  You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data. |

Response

1{  
2  'code': 10000,  
3  'msg': 'success',  
4  'data': {  
5    'records': \[  
6      {  
7        'recordId': '20250116073333231508600365121536',  
8        'orderId': '1737011983',  
9        'coinId': 1482,  
10        'coinSymbol': 'TRX',  
11        'chain': 'TRX',  
12        'contract': 'TRX',  
13        'coinUSDPrice': '0.23717',  
14        'fromAddress': 'TRPKg7eGMy9aZS2RumSPeWoyVkDqTVwLgL',  
15        'toAddress': 'TAkmn3f8bgwMAwdVrGfUVSRg4W2XwqgHGc',  
16        'toMemo': '',  
17        'amount': '0.5',  
18        'serviceFee': '0.0025',  
19        'txId': 'f39abf3275607fe2ffd40c06adf877f249829f6d1146a4f72ca2ad79ed7ed072',  
20        'status': 'Success',  
21        'arrivedAt': 1737012813,  
22        'isFlaggedAsRisky': False  
23      },  
24      ...  
25    \],  
26    'nextId': ''  
27  }  
28}  
**Withdrawal API**

**Create Network Withdrawal Order**

This endpoint creates a withdrawal order to a blockchain address.

If a withdrawal is processing, CCPayment will send a webhook with the status of "Processing". If a withdrawal is confirmed, CCPayment will send a second webhook with the status of "Success". In some cases, on-chain processing is too fast to capture processing information. There will only be one webhook sent with the status of "Success".

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/applyAppWithdrawToNetwork

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |
| chain | String | Yes | Symbol of the chain |
| address | String | Yes | Withdrawal destination address |
| memo | String | No | Memo of the withdrawal address |
| orderId | String | Yes | Withdrawal order ID, 3-64 characters in length |
| amount | String | Yes | Withdrawal amount |
| merchantPayNetworkFee | Boolean | No | `True`: merchants pay network fee Net receivable \= withdrawal amount `False`: (default) users pay network fee Net receivable \= withdrawal amount \- network fee |

Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/applyAppWithdrawToNetwork";  
8const getPath \= "https://ccpayment.com/ccpayment/v2/getAppWithdrawRecord";  
 9  
10const args \= JSON.stringify({  
11  "coinId": 1280,  
12  "address": "0xBb9C4e7F3687aca1AE2828c18f9E3ae067F569FE",  
13  "orderId": String(Math.floor(Date.now() / 1000)),  
14  "chain": "POLYGON",  
15  "amount": "0.001",  
16  *//"merchantPayNetworkFee": False,*  
17  *//"memo": ""*   
18});  
19  
20const timestamp \= Math.floor(Date.now() / 1000);  
21let signText \= appId \+ timestamp;  
22if (args.length \!== 0) {  
23  signText \+= args;  
24}  
25  
26const sign \= crypto  
27  .createHmac("sha256", appSecret)  
28  .update(signText)  
29  .digest("hex");  
30  
31const options \= {  
32  method: "POST",  
33  headers: {  
34    "Content-Type": "application/json",  
35    "Appid": appId,  
36    "Sign": sign,  
37    "Timestamp": timestamp.toString(),  
38  },  
39  timeout: 15000,  
 40};  
41  
42  
43function isTimeoutError(err) {  
44  return err.code \=== "ETIMEDOUT";  
45}  
46  
47  
48function makeRequest(path, args, retryCount \= 3) {  
49  return new Promise((resolve, reject) \=\> {  
50    const req \= https.request(path, options, (res) \=\> {  
51      let respData \= "";  
52  
53      res.on("data", (chunk) \=\> {  
54        respData \+= chunk;  
55      });  
56  
57      res.on("end", () \=\> {  
58        resolve(respData);  
59      });  
60    });  
61  
62    req.on("error", (err) \=\> {  
63      if (isTimeoutError(err) && retryCount \> 0) {  
64        setTimeout(() \=\> {  
65          resolve(makeRequest(path, args, retryCount \- 1));  
66        }, 200);  
 67      } else {  
68        reject(err);  
69      }  
70    });  
71  
72    req.write(args);  
73    req.end();  
74  });  
75}  
76  
77function getWithdrawRecord(orderId, retryCount \= 3) {  
78  const args \= JSON.stringify({ orderId });  
79  
80  return makeRequest(getPath, args, retryCount)  
81    .then((response) \=\> {  
82      console.log("Withdraw Record:", response);  
83      return response;  
84    })  
85    .catch((error) \=\> {  
86      console.error("Error querying withdrawal record:", error);  
87    });  
88}  
89  
90makeRequest(path, args)  
91  .then((response) \=\> {  
92    console.log("Withdrawal Request Response:", response);  
93  })  
94  .catch((error) \=\> {  
95    if (isTimeoutError(error)) {  
96      console.log("Request timed out. Querying withdrawal record...");  
97      const orderId \= String(Math.floor(Date.now() / 1000));  
98      getWithdrawRecord(orderId);  
 99    } else {  
100      console.error("Error:", error);  
101    }  
102  });

   })  
85    .catch((error) \=\> {  
86      console.error("Error querying withdrawal record:", error);  
87    });  
88}  
89  
90makeRequest(path, args)  
91  .then((response) \=\> {  
92    console.log("Withdrawal Request Response:", response);  
93  })  
94  .catch((error) \=\> {  
95    if (isTimeoutError(error)) {  
96      console.log("Request timed out. Querying withdrawal record...");  
97      const orderId \= String(Math.floor(Date.now() / 1000));  
98      getWithdrawRecord(orderId);  
 99    } else {  
100      console.error("Error:", error);  
101    }  
102  });  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.recordId | String | Record ID |

In the rare event of network jitter on your server, where you may not receive our response in a timely manner, please reconfirm the withdrawal status using the [Get Withdrawal Record](https://ccpayment.com/api/doc?en#get-withdrawal-record) API. If the response indicates 'withdrawal success', this confirms that the withdrawal request has been successfully processed.  
Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5      "recordId": "202403120909501767478092588126208"  
6    }  
7  }  
Webhook for API Withdrawal

The payload of the webhook will include both the order ID and the record ID. You should use the record ID to call [Get Withdrawal Record](https://ccpayment.com/api/doc?en#get-withdrawal-record) to retrieve the transfer information and update the withdrawal status or deduct the amount from your user's account accordingly.

Webhook Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| type | String | Type: ApiWithdrawal |
| msg | Object |  |
| msg.recordId | String | CCPayment unique ID for a transaction |
| msg.orderId | String | Your unique ID for the order |
| msg.coinId | Integer | Coin ID |
| msg.coinSymbol | String | Coin symbol |
| msg.status | String | Withdrawal status:  `Processing`: transaction is processing `Success`: transaction has been confirmed `Failed`: transaction failed `WaitingApproval`: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard `Rejected`: Withdrawal request has been rejected by merchant |

Once a withdrawal transaction is initiated, the blockchain will confirm the transaction within a few minutes. However, due to rare external circumstances, merchants may sometimes fail to receive timely webhook notifications.  
Request Example

1{  
2  "type": "ApiWithdrawal",  
3  "msg": {  
4    "recordId": "20240313120722176788...",  
5    "orderId": "6322851679...",  
6    "coinId": 1891,  
7    "coinSymbol": "TETH",  
8    "status": "Success"  
9  }  
10}  
Withdrawal to Cwallet Account

This endpoint creates the withdrawal order to Cwallet account

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/applyAppWithdrawToCwallet

Parameters

thdrawal to Cwallet Account

This endpoint creates the withdrawal order to Cwallet account

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/applyAppWithdrawToCwallet

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | Yes | Coin ID |
| cwalletUser | String | Yes | Cwallet users, Cwallet ID and Email are both OK. |
| amount | String | Yes | Withdrawal amount. Minimum limit is 0.001 USD. |
| orderId | String | Yes | Order ID, 3-64 characters in length |

Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/applyAppWithdrawToCwallet";  
8const args \= JSON.stringify({  
9  "coinId": 1280,  
10  "cwalletUser": '9558861',  
11  "orderId": String(Math.floor(Date.now() / 1000)),  
12  "amount": "0.002"  
13});  
14  
15const timestamp \= Math.floor(Date.now() / 1000);  
16let signText \= appId \+ timestamp;  
17if (args.length \!== 0) {  
18  signText \+= args;  
19}  
20  
21const sign \= crypto  
22  .createHmac("sha256", appSecret)  
23  .update(signText)  
24  .digest("hex");  
25  
26const options \= {  
27  method: "POST",  
28  headers: {  
29    "Content-Type": "application/json",  
30    "Appid": appId,  
31    "Sign": sign,  
32    "Timestamp": timestamp.toString(),  
33  },  
34};  
35  
36const req \= https.request(path, options, (res) \=\> {  
37  let respData \= "";  
38  
39  res.on("data", (chunk) \=\> {  
40    respData \+= chunk;  
41  });  
42  
43  res.on("end", () \=\> {  
44    console.log("Response:", respData);  
45  });  
46});  
47  
48req.write(args);  
49req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.recordId | String | Record ID for the transaction |

For transactions transferred to a Cwallet account, we will not send a webhook notification. Please reconfirm the withdrawal status using the [Get Withdrawal Record](https://ccpayment.com/api/doc?en#get-withdrawal-record) API. If the response indicates 'withdrawal success', this confirms that the withdrawal request has been successfully processed.  
Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5      "recordId": "202403120913091767478929213362176"  
6    }  
7  }

**Get Withdrawal Record**

This endpoint retrieves one specific withdrawal information.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppWithdrawRecord

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| recordId | String | No | CCPayment unique ID for a transaction |
| orderId | String | No | Order ID, 3-64 characters in length |

`recordId` and `orderId` cannot both be empty.  
Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/getAppWithdrawRecord";  
8const args \= JSON.stringify({  
9  "recordId": '202403010341121763409125674323968',  
10  *//"orderId": '17071162236'*  
11});  
12  
13const timestamp \= Math.floor(Date.now() / 1000);  
14let signText \= appId \+ timestamp;  
15if (args.length \!== 0) {  
16  signText \+= args;  
17}  
18  
19const sign \= crypto  
20  .createHmac("sha256", appSecret)  
21  .update(signText)  
22  .digest("hex");  
23  
24const options \= {  
25  method: "POST",  
26  headers: {  
27    "Content-Type": "application/json",  
28    "Appid": appId,  
29    "Sign": sign,  
30    "Timestamp": timestamp.toString(),  
31  },  
32};  
33  
34const req \= https.request(path, options, (res) \=\> {  
35  let respData \= "";  
36  
37  res.on("data", (chunk) \=\> {  
38    respData \+= chunk;  
39  });  
40  
41  res.on("end", () \=\> {  
42    console.log("Response:", respData);  
43  });  
44});  
45  
46req.write(args);  
47req.end();  
Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.record | Object |  |
| data.record.recordId | String | CCPayment unique ID for a transaction |
| data.record.withdrawType | String | Withdrawal type:  `Cwallet`: withdrawals to Cwallet users `Network`: withdrawals to blockchain addresses |
| data.record.coinId | Integer | Coin ID |
| data.record.coinSymbol | String | Coin symbol |
| data.record.chain | String | Symbol of the chain |
| data.record.cwalletUser | String | Cwallet user ID. It will only be returned if the withdrawal is to a Cwallet user. |
| data.record.fromAddress | String | From address, if the transaction is a UTXO type or an internal transfer to Cwallet, this parameter will not be returned. |
| data.record.toAddress | String | Blockchain address. It will only be returned if the withdrawal is to a blockchain address. |
| data.record.toMemo | String | Memo of the address. It will only be returned if the withdrawal is to a blockchain address. |
| data.record.txId | String | Blockchain transaction ID. It will only be returned if the withdrawal is to a blockchain address. |
| data.record.status | String | `Processing`: transaction is processing `Success`: transaction has been confirmed `Failed`: transaction failed `WaitingApproval`: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard `Rejected`: Withdrawal request has been rejected by merchant |
| data.record.orderId | String | Order ID |
| data.record.amount | String | Withdrawal amount |
| data.record.fee | Object | Network fee. Only withdrawals to a blockchain address will incur a network fee. |
| data.record.fee.coinId | String | Coin ID of the network fee coin |
| data.record.fee.coinSymbol | String | Coin symbol of the network fee coin |
| data.record.fee.amount | String | Amount of the network fee |

Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5      "record": {  
6        "recordId": "202403120909501767478092588126208",  
7        "withdrawType": "Network",  
8        "coinId": 1891,  
9        "coinSymbol": "TETH",  
10        "chain": "POLYGON",  
11        "fromAddress": "0x1AE2828c18f9E3ae067F569aca1AE2828C4e7",  
12        "toAddress": "0xBb9C4e7F3687aca1AE2828c18f9E3ae067F569FE",  
13        "orderId": "1710234589577",  
14        "txId": "0xb55bb28292de56432b06204f71c68847a71670f2fc311af5c53a6ded45ab047b",  
15        "toMemo": "",  
16        "status": "Success",  
17        "amount": "0.004",  
18        "fee": {  
19          "coinId": 1891,  
20          "coinSymbol": "TETH",  
21          "amount": "0.001"  
22        }  
23      }  
24    }  
25  }  
26   

**Get Withdrawal Record List**

This endpoint retrieves a list of withdrawals records.

HTTP Request

POSThttps://ccpayment.com/ccpayment/v2/getAppWithdrawRecordList

Parameters

| Parameters | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| coinId | Integer | No | Coin ID |
| orderIds | Array\[string\] | No | Order ID for the withdrawal. 3-64 in length. The maximum limit for one query is 20 order IDs. |
| chain | String | No | Symbol of the chain |
| startAt | Integer | No | Retrieve all transaction records starting from the specified `startAt` timestamp. |
| endAt | Integer | No | Retrieve all transaction records up to the specified `endAt` timestamp. |
| nextId | String | No | Next ID |

If the query result exceeds 20 records, a "nextId" field will be returned.

You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data.  
Request Example

1const https \= require("https");  
2const crypto \= require("crypto");  
3  
4const appId \= "\*\*\* your appId \*\*\*";  
5const appSecret \= "\*\*\* your appSecret \*\*\*";  
6  
7const path \= "https://ccpayment.com/ccpayment/v2/getAppWithdrawRecordList";  
8const args \= JSON.stringify({  
9  *//"coinId": 1280,*  
10  *//"orderIds": \["1697445039666"\],*  
11  *//"chain": "POLYGON",*  
12  *//"startAt": 1672506061,*  
13  *//"endAt": 1704042061,*  
14  *//"nextId": "46f62e0546f785cf961b922d024236aa",*  
15});  
16  
17const timestamp \= Math.floor(Date.now() / 1000);  
18let signText \= appId \+ timestamp;  
19if (args.length \!== 0) {  
20  signText \+= args;  
21}  
22  
23const sign \= crypto  
24  .createHmac("sha256", appSecret)  
25  .update(signText)  
26  .digest("hex");  
27  
28const options \= {  
29  method: "POST",  
30  headers: {  
31    "Content-Type": "application/json",  
32    "Appid": appId,  
33    "Sign": sign,  
34    "Timestamp": timestamp.toString(),  
35  },  
36};  
37  
38const req \= https.request(path, options, (res) \=\> {  
39  let respData \= "";  
40  
41  res.on("data", (chunk) \=\> {  
42    respData \+= chunk;  
43  });  
44  
45  res.on("end", () \=\> {  
46    console.log("Response:", respData);  
47  });  
48});  
49  
50req.write(args);  
51req.end();

Response Parameters

| Parameters | Type | Description |
| :---- | :---- | :---- |
| data | Object |  |
| data.records | Array |  |
| data.records\[index\].recordId | String | CCPayment unique ID for a transaction |
| data.records\[index\].withdrawType | String | Withdrawal type:  `Cwallet`: withdrawals to Cwallet users `Network`: withdrawals to blockchain addresses |
| data.records\[index\].coinId | Integer | Coin ID |
| data.records\[index\].coinSymbol | String | Coin symbol |
| data.records\[index\].chain | String | Symbol of the chain |
| data.records\[index\].orderId | String | Order ID |
| data.records\[index\].cwalletUser | String | Cwallet user ID. It will only be returned if the withdrawal is to a Cwallet user. |
| data.records\[index\].fromAddress | String | From address, if the transaction is a UTXO type or an internal transfer to Cwallet, this parameter will not be returned. |
| data.records\[index\].toAddress | String | Blockchain address. It will only be returned if the withdrawal is to a blockchain address. |
| data.records\[index\].toMemo | String | Memo of the address. It will only be returned if the withdrawal is to a blockchain address. |
| data.records\[index\].amount | String | Withdrawal amount |
| data.records\[index\].txId | String | Blockchain transaction ID. It will only be returned if the withdrawal is to a blockchain address. |
| data.records\[index\].status | String | Withdrawal status:  `Processing`: transaction is processing `Success`: transaction has been confirmed `Failed`: transaction failed `WaitingApproval`: Withdrawal is waiting manual approval. This status will be returned only if the merchant has enabled the withdrawal approval on the dashboard `Rejected`: Withdrawal request has been rejected by merchant |
| data.records\[index\].fee | Object | Network fee. Only withdrawals to a blockchain address will incur a network fee. |
| data.records\[index\].fee.coinId | String | Coin ID of the network fee coin |
| data.records\[index\].fee.coinSymbol | String | Coin symbol of the network fee coin |
| data.records\[index\].fee.amount | String | Amount of the network fee |
| data.nextId | String | If the query result exceeds 20 records, a "nextId" field will be returned.  You can use the same query conditions along with the "nextId" field to retrieve the remaining transaction data |

Response

1{  
2    "code": 10000,  
3    "msg": "success",  
4    "data": {  
5      "records": \[  
6        {  
7          "recordId": "202403120909501767478092588126208",  
8          "withdrawType": "Network",  
9          "coinId": 1891,  
10          "coinSymbol": "TETH",  
11          "chain": "POLYGON",  
12          "fromAddress": "0x1AE2828c18f9E3ae067F569aca1AE2828C4e7",  
13          "toAddress": "0xBb9C4e7F3687aca1AE2828c18f9E3ae067F569FE",  
14          "orderId": "1710234589577",  
15          "txId": "0xb55bb28292de56432b06204f71c68847a71670f2fc311af5c53a6ded45ab047b",  
16          "toMemo": "",  
17          "status": "Success",  
18          "amount": "0.004",  
19          "fee": {  
20            "coinId": 1891,  
21            "coinSymbol": "TETH",  
22            "amount": "0.001"  
23          }  
24        },  
25        {  
26          "recordId": "202403120913091767478929213362176",  
27          "withdrawType": "Cwallet",  
28          "coinId": 1329,  
29          "coinSymbol": "MATIC",  
30          "chain": "Cwallet OS",  
31          "cwalletUser": "35255142",  
32          "orderId": "1710234789039",  
33          "txId": "",  
34          "toMemo": "",  
35          "status": "Success",  
36          "amount": "0.002"  
37        }\],  
38      "nextId": ""  
39    }  
40  }  
41   

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,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>

[image10]: <data:image/png;base64,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>

[image11]: <data:image/png;base64,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>

[image12]: <data:image/png;base64,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>

[image13]: <data:image/png;base64,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>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,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>

[image16]: <data:image/png;base64,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>

[image17]: <data:image/png;base64,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>