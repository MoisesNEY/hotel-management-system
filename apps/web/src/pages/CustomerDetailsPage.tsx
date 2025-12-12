import React from 'react';
import CustomerDetailsForm from '../components/CustomerDetailsForm';
import '../styles/customer-details.css';

const CustomerDetailsPage: React.FC = () => {
  return (
    <div className="customer-details-page">
      <CustomerDetailsForm />
    </div>
  );
};

export default CustomerDetailsPage;