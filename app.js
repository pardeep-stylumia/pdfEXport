let express = require("express");
let app = express();
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
let fs = require('fs');
const AWS  = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, ''));
let details = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
app.get("/generateReport", (req, res) => {
	ejs.renderFile(path.join(__dirname, './views/', "report-template.ejs"), { details: details }, (err, data) => {
		if (err) {
			res.send(err);
		} else {
			let options = {
				"height": "11.25in",
				"width": "8.5in",
				"header": {
					"height": "10mm"
				},
				"footer": {
					"height": "10mm",
				},
				"phantomPath": '/opt/phantomjs_linux-x86_64'
			};
			pdf.create(data, options).toFile("report.pdf", function (err, data) {
				if (err) {
					res.send(err);
				} else {
					var data = fs.readFileSync('./report.pdf');
					res.contentType("application/pdf");
					res.send(data);
					//res.render('views/report-template',{ details: details });
				}
			});
		}
	});
})
module.exports = app;