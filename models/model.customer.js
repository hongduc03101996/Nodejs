class CustomerModel
{
	
	constructor(guid, first_name, last_name, email, zipcode)
	{
		this.guid = guid;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.zipcode = zipcode;
	}
}

module.exports = CustomerModel;