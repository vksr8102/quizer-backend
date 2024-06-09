import Sibapiv3sdk from "sib-api-v3-sdk"
import ejs from "ejs"
import dotenv from "dotenv"

dotenv.config({ path: ".env" });

const client  = Sibapiv3sdk.ApiClient.instance;
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sibapiv3sdk.TransactionalEmailsApi();
const sendEmail = async(obj)=>{
let htmlText='';
if(obj.template){
    htmlText = await ejs.renderFile(`${__basedir}${obj.template}/html.ejs`, {data:obj.data || null});
}

const sender ={
    email:process.env.COMPANY_EMAIL,
    name:process.env.COMPANY_NAME
}

const receivers =[
    {
        email:obj.to
    }
]

// console.log(sender)
// console.log(receivers)

return tranEmailApi.sendTransacEmail({
    sender,
    to:receivers,
    subject:obj.subject,
    htmlContent:htmlText
}).then(console.log).catch(console.log)

}

export {sendEmail}