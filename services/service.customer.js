const CustomerModel = require("../models/model.customer");
const PasswordModel = require("../models/model.password");
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let Validator = require('fastest-validator');

let customers = {};

/* create an instance of the validator */
let customerValidator = new Validator();

/* use the same patterns as on the client to validate the request */
let namePattern = /([A-Za-z\-\’])*/;
let zipCodePattern = /^[0-9]{5}(?:-[0-9]{4})?$/;
let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;

mongoose.connect('mongodb://localhost/local',{ useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new mongoose.Schema({
    first_name: { type: "string", min: 1, max: 50, pattern: namePattern},
    last_name: { type: "string", min: 1, max: 50, pattern: namePattern},
    email: { type: "string", max: 75 },
	zipcode: { type: "string", max: 5, pattern: zipCodePattern},
	guid: {type: "string", min: 3}
})

const passwordSchema = new mongoose.Schema({
	guid: {type: "string", min: 3},
	password: { type: "string", min: 2, max: 50, pattern: passwordPattern}
})

const user = mongoose.model('user', userSchema)

const user_password = mongoose.model('password', passwordSchema)

/* customer validator shema */
const customerVSchema = {
		guid: {type: "string", min: 3},
		
		first_name: { type: "string", min: 1, max: 50, pattern: namePattern},
		last_name: { type: "string", min: 1, max: 50, pattern: namePattern},
		email: { type: "string", max: 75 },
		zipcode: { type: "string", max: 5, pattern: zipCodePattern},

		password: { type: "string", min: 2, max: 50, pattern: passwordPattern}
	};

	
/* static customer service class */
class CustomerService
{
	static create(data, callback)
	{
		var vres = customerValidator.validate(data, customerVSchema);
		
		/* validation failed */
		if(!(vres === true))
		{
			let errors = {}, item;

			for(const index in vres)
			{
				item = vres[index];

				errors[item.field] = item.message;
			}
			
			throw {
			    name: "ValidationError",
			    message: errors
			};
		}

		let customer = new CustomerModel(data.guid, data.first_name, data.last_name, data.email, data.zipcode);

		user.create({
		    guid: data.guid ,
		    first_name: data.first_name,
		    last_name: data.last_name,
		    email: data.email,
		    zipcode: data.zipcode
		})
		
		let customer_password = new PasswordModel(data.guid, data.password);
		var salt = bcrypt.genSaltSync(10)
		var hash = bcrypt.hashSync(data.password, salt)
		user_password.create({
			guid: data.guid,
			password: hash
		})
		//console.log('compare: ' + bcrypt.compareSync('Mrta140986', hash));
		callback(customer);
	}

	static retrieveAll(callback) {
		//console.log("2/" + user.find());
		
		user.find().exec((err, users) => {
			if(err) {
				throw new Error('Unable to retrieve list of customers');
			}
			else {
				console.log(users);
				callback (users);
			}
			// console.log(users[0]);
		})
	}

	static retrieveById(guid, callback) {
		//console.log("2/" + user.find());
		
		user.findOne({guid: guid}).exec((err, user) => {
			if(user) {
				//console.log('find: '+  user);
				callback (user);
			}
			else {
				throw new Error('Unable to retrieve a customer by (guid:'+ guid +')');
			}
			// console.log(users[0]);
		})
	}

	static retrieveByEmail(email, callback) {
		//console.log("2/ " + email);
		
		user.findOne({email: email}).exec((err, user) => {
			if(user) {
				//console.log('find: '+  user);
				callback (user);
			}
			else {
				callback(null);
			}
			// console.log(user_pass[0]);
		})
	}

	static retrievePass(guid, callback) {
		//console.log("2/" + user.find());
		
		user_password.findOne({guid: guid}).exec((err, user_pass) => {
			if(user_pass) {
				//console.log('find: '+  user_pass);
				callback (user_pass);
			}
			else {
				throw new Error('Unable to retrieve a customer_password by (guid:'+ guid +')');
			}
			// console.log(user_pass[0]);
		})
	}

	static checkLogin(data,callback) {
		console.log(data);
		
		user.findOne({email: data.email}).exec((err, u) => {
			if(u) {
				console.log('find: '+  u);
				
				user_password.findOne({guid: u.guid}).exec((err, user_pass) => {
					if(user_pass)
					{
						console.log('find: '+  user_pass);
						
						console.log('compare ' + data.password + ' - ' + user_pass.password);

						if (bcrypt.compareSync(data.password, user_pass.password)) {
							console.log(u.guid);
							callback(undefined, u.guid);
						}
						else {
							callback(new Error('Invalid password'));
						}
					}
					else {
						callback(new Error('Unable to retrieve a customer_password by (guid:'+ u.guid +')'));
					}
					// console.log(user_pass[0]);
				})
			}
			else {
				callback(new Error('Invalid email'));
			}
			// console.log(user_pass[0]);
		})
	}

	static update(guid, data, callback) {
		console.log(guid);
		console.log(data);
		user.updateOne({guid: guid},{first_name: data.first_name, last_name: data.last_name, zipcode: data.zipcode}).exec((err,result) => {
			if(result) {
				console.log(result);
				callback(undefined, result);
			}
			else {
				callback(new Error('Unable to update customer by guid: ' + guid));
			}
		});
	}

	static updatePassword(guid, data, callback) {
		console.log(guid);
		console.log('data');
		console.log(data.password);
		var salt = bcrypt.genSaltSync(10)
		var hash = bcrypt.hashSync(data.password, salt)
		user_password.updateOne({guid: guid},{password: hash}).exec((err,result) => {
			if(result) {
				console.log(result);
				callback(undefined, result);
			}
			else {
				callback(new Error('Unable to update customer password by guid: ' + guid));
			}
		});
	}

	static delete(uid)	{
		if(customers[uid] != null) {
			delete customers[uid];
		}
		else {
			throw new Error('Unable to retrieve a customer by (uid:'+ cuid +')');
		}
	}

	
}

module.exports = CustomerService;