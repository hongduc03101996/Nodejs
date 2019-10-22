var express = require('express');
var router = express.Router();
var CustomerService = require('../services/service.customer');

/* adds a new customer to the list */
router.post('/', async (req, res, next) => {
	const body = req.body;
	try	{
		CustomerService.retrieveByEmail(body.email, result => {
			if (result) {
				console.log(result);
				return res.json({ err: 'Email exist' });
			}
			else {
				CustomerService.create(body, customer => {
					console.log(customer.guid);

					if(body.guid != null)
					{
						customer.guid = body.guid;
					}
					//console.log(customer.guid);
					
					// created the customer! 
					return res.status(201).json({ err: null });
				});
			}
		})
	}
	catch(err) {
		if (err.name === 'ValidationError')	{
        	return res.status(400).json({ error: err.message });
		}

		// unexpected error
		return next(err);
	}
});

/* login */
router.post('/login', async (req, res, next) => {
	const body = req.body;
	try	{
		console.log(body);
		CustomerService.checkLogin(body, (err, result) => {
			if (err) {
				console.log(err.message);
				return res.json({ err: err.message });
			}
			else {
				console.log('result ' + result);
				res.cookie('guid', result, { maxAge: 900000, httpOnly: true });
				return res.json({ result: result });
			}
		});
		
	}
	catch(err) {
		// unexpected error
		return next(err);
	}
});

/* retrieves list of customer */
router.get('/', async (req, res, next) => {
	try	{
		CustomerService.retrieveAll(customers => {
			console.log("get1: " + customers);
			return res.json({ customers: customers});
		});
	}
	catch(err) {
		// unexpected error
		return next(err);
	}
});

/* retrieves a customer by guid */
router.get('/:guid', async (req, res, next) => {
	try	{
		CustomerService.retrieveById(req.params.guid, customer => {
			//console.log("get: " + customer);
			CustomerService.retrievePass(req.params.guid, password => {
				//console.log("get: " + password);
				return res.json({ customer: customer, password: password });
			});
		});
	}
	catch(err) {
		// unexpected error
		return next(err);
	}
});


/* updates the customer by uid */
router.put('/:guid', async (req, res, next) => {
	try	{
		CustomerService.update(req.params.guid, req.body, (err,result) => {
			if (err) {
				console.log(err.message);
				return res.json({ err: err.message });
			}
			else {
				console.log(result);
				return res.status(201).json({ err: null });
			}
		});
	}
	catch(err) {
		// unexpected error
		return next(err);
	}
});

/* updates the customer password by uid */
router.put('/password/:guid', async (req, res, next) => {
	try	{
		console.log('password: ' + req.body);
		CustomerService.updatePassword(req.params.guid, req.body, (err,result) => {
			if (err) {
				console.log(err.message);
				return res.json({ err: err.message });
			}
			else {
				console.log(result);
				return res.status(201).json({ err: null });
			}
		});
	}
	catch(err) {
		// unexpected error
		return next(err);
	}
});

/* removes the customer from the customer list by uid */
router.delete('/:id', async (req, res, next) => {
	try	{
		const customer = await CustomerService.delete(req.params.id);

		return res.json({success: true});
	}
	catch(err) {
		// unexpected error
		return next(err);
	}
});

module.exports = router;