var mongoose = require("mongoose");
var Coin = require("./models/coins");
var comment = require("./models/comment");

var data = [
{
	count: 1,
	name: "Bitcoin",
	icon: "http://res.cloudinary.com/rafamendes/image/upload/v1526915763/yqlpmas3judeygetg7p6.png",
	description: "Bitcoin (BTC) is a digital currency, which is used and distributed electronically.  Bitcoin is a decentralised peer-to-peer network. No single institution or person controls it.  Bitcoins can’t be printed and their amount is very limited – only 21 mln Bitcoins can ever be created.",
	video: "https://www.youtube.com/embed/Da9Q57vov_c",
	acronym: "BTC"
},
{
	count: 2,
	name: "Ethereum",
	icon: "http://res.cloudinary.com/rafamendes/image/upload/v1526925831/teswapewukymerozwmkj.png",
	description: "Ethereum is a decentralized software platform that enables SmartContracts and Distributed Applications (ĐApps) to be built and run without any downtime, fraud, control or interference from a third party.",
	video: "https://www.youtube.com/embed/Da9Q57vov_c",
	acronym: "ETH"
},
{
	count: 3,
	name: "Verge",
	icon: "http://res.cloudinary.com/rafamendes/image/upload/v1526981997/bjii7kg5dxxjrmprxypi.png",
	description: "Verge is a cryptocurrency designed for people and for everyday use. It improves upon the original Bitcoin blockchain and aims to fulfill its initial purpose of providing individuals and businesses with a fast, efficient and decentralized way of making direct transactions while maintaining your privacy.",
	video: "https://www.youtube.com/embed/Da9Q57vov_c",
	acronym: "XVG"
}
]

function seedDB(){
	// Remove all coins
	Coin.remove({}, (err) => {
		if(err){
			console.log(err);
		}
		console.log("Removed all");
		data.forEach((seed) => {
			Coin.create(seed, (err, data) => {
				if(err){
					console.log("deu ruim");
				} else {
					console.log("DB seeded");
					comment.remove({}, (err) => {
						if(err){
							console.log(err);
						}
						comment.create({text: "what a shitcoin!", author: "Banker"}, (err, comment)=>{
							if(err){
								console.log(err);
							}else{
								console.log("Comment created");		
								data.comments.push(comment);
								data.save();
							}
						});	
					});
				}
			});
		});
	});
}
module.exports = seedDB;