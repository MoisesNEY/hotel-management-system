import React, { useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
// import { User, Mail, MapPin, Briefcase } from 'lucide-react'; // Unused icons removed

const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "", disabled = false }: any) => (
    <div className="form-group mb-4">
        <label className="block text-xs uppercase text-gray-500 font-bold mb-2 tracking-wide">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`
                w-full px-3 py-2 
                bg-white border text-gray-700 text-sm
                ${disabled ? 'border-transparent bg-transparent text-gray-500 cursor-not-allowed' : 'border-gray-200 focus:border-cyan-400'}
                rounded transition-colors duration-200 outline-none
                placeholder-gray-300
            `}
        />
    </div>
);

const UserProfileView: React.FC = () => {
    const [formData, setFormData] = useState({
        company: 'Creative Code Inc.',
        username: 'michael23',
        firstName: 'Chet',
        lastName: 'Faker',
        email: '',
        address: 'Melbourne, Australia',
        city: 'Melbourne',
        country: 'Australia',
        zipCode: '',
        aboutMe: "Oh so, your weak rhyme You doubt I'll bother, reading into it"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Perfil actualizado correctamente');
    };

    return (
        <div className="content">
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>

                {/* Profile Card (Left on Large, Top on Mobile? - Original template has it on Right actually in some demos, but we keep it Left or Right based on user preference, typically Left 4 cols, Right 8 cols in this requested layout) */}
                <div className="col-md-4" style={{ width: '33.33333%', padding: '0 15px', flex: '0 0 33.33333%', maxWidth: '33.33333%' }}>
                    <div className="card card-user" style={{
                        borderRadius: '12px',
                        boxShadow: '0 6px 10px -4px rgba(0,0,0,0.15)',
                        backgroundColor: '#fff',
                        marginBottom: '20px',
                        overflow: 'hidden', /* For the background image */
                        border: '0 none'
                    }}>
                        <div className="image" style={{ height: '110px', overflow: 'hidden', position: 'relative' }}>
                            <img src="https://demos.creative-tim.com/paper-dashboard-react/static/media/damir-bosnjak.45952932.jpg" alt="..." style={{ width: '100%', height: 'auto' }} />
                        </div>
                        <div className="card-body" style={{ minHeight: '240px', padding: '15px 15px 10px 15px', textAlign: 'center' }}>
                            <div className="author" style={{ marginTop: '-65px', textAlign: 'center' }}>
                                <a href="#pablo" onClick={e => e.preventDefault()} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        width: '124px',
                                        height: '124px',
                                        border: '5px solid #fff',
                                        borderRadius: '50%',
                                        margin: '0 auto',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        {/* Placeholder Avatar */}
                                        <img src="https://demos.creative-tim.com/paper-dashboard-react/static/media/mike.4947936a.jpg" alt="..." style={{ width: '100%' }} />
                                    </div>
                                    <h5 className="title" style={{ color: '#403D39', fontSize: '1.57em', fontWeight: 600, lineHeight: '1.4em', marginBottom: '0', marginTop: '10px' }}>
                                        {formData.firstName} {formData.lastName}
                                    </h5>
                                </a>
                                <p className="description" style={{ color: '#9A9A9A', fontWeight: 400, fontSize: '14px' }}>
                                    @{formData.username}
                                </p>
                            </div>
                            <p className="description text-center" style={{ marginTop: '15px', color: '#9A9A9A', fontSize: '14px', lineHeight: '1.5' }}>
                                "{formData.aboutMe}"
                            </p>
                        </div>
                        <div className="card-footer" style={{ borderTop: '1px solid #ddd', padding: '15px 15px 10px 15px', backgroundColor: 'transparent' }}>
                            <hr style={{ marginTop: '5px', marginBottom: '15px', border: 0 }} />
                            <div className="button-container" style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                <Button className="btn-icon btn-round" variant="ghost" size="sm" style={{ color: '#3b5998' }}><i className="fa fa-facebook"></i> F</Button>
                                <Button className="btn-icon btn-round" variant="ghost" size="sm" style={{ color: '#55acee' }}><i className="fa fa-twitter"></i> T</Button>
                                <Button className="btn-icon btn-round" variant="ghost" size="sm" style={{ color: '#dd4b39' }}><i className="fa fa-google"></i> G</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form (Right, 8 cols) */}
                <div className="col-md-8" style={{ width: '66.66667%', padding: '0 15px', flex: '0 0 66.66667%', maxWidth: '66.66667%' }}>
                    <Card title="Edit Profile" className="card-user">
                        <form onSubmit={handleSubmit}>
                            {/* Row 1 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-5 pr-1" style={{ width: '41.66667%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Company (disabled)"
                                        name="company"
                                        value={formData.company}
                                        disabled={true}
                                    />
                                </div>
                                <div className="col-3 px-1" style={{ width: '25%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-4 pl-1" style={{ width: '33.33333%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Email address"
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-6 pr-1" style={{ width: '50%', padding: '0 15px' }}>
                                    <FormInput
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6 pl-1" style={{ width: '50%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-12" style={{ width: '100%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-4 pr-1" style={{ width: '33.33333%', padding: '0 15px' }}>
                                    <FormInput
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-4 px-1" style={{ width: '33.33333%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-4 pl-1" style={{ width: '33.33333%', padding: '0 15px' }}>
                                    <FormInput
                                        label="Postal Code"
                                        name="zipCode"
                                        type="number"
                                        placeholder="ZIP Code"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="col-12" style={{ width: '100%', padding: '0 15px' }}>
                                    <div className="form-group">
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2 tracking-wide">
                                            About Me
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-cyan-400 transition-colors resize-none placeholder-gray-300"
                                            rows={4}
                                            name="aboutMe"
                                            value={formData.aboutMe}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
                                <div className="update ml-auto mr-auto" style={{ margin: '0 auto', marginTop: '15px' }}>
                                    <Button>
                                        Update Profile
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
