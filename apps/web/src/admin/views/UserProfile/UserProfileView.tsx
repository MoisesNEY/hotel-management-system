import React, { useState } from 'react';
import Card from '../../components/shared/Card';
import { User } from 'lucide-react';

const FormInput = ({ label, name, value, onChange, type = "text", placeholder = "", disabled = false }: any) => (
    <div className="form-group">
        <label className="block text-xs uppercase text-gray-400 font-semibold mb-2 tracking-wider">
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
                ${disabled ? 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-200 focus:border-blue-400'}
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
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '+1 234 567 8900',
        address: 'Calle Principal 123',
        city: 'Ciudad de México',
        country: 'México',
        zipCode: '01000',
        bio: 'Administrador del sistema de gestión hotelera.'
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
        <div className="space-y-6">
            {/* Header */}
            {/* <div className="mb-6">
                 <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
            </div> */}
            {/* Header hidden to match original template minimal look if desired, or kept small */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="shadow-card border border-gray-100 lg:col-span-1 h-fit">
                    <div className="flex flex-col items-center text-center pb-4">
                        <div className="relative -mt-12 mb-4">
                            <div className="w-32 h-32 bg-white p-1 rounded-full shadow-lg">
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                                    {/* Placeholder for real image */}
                                    <User className="w-16 h-16 text-white opacity-80" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium mb-4">@{formData.username}</p>

                        <p className="text-gray-500 text-sm px-6 italic mb-6">
                            "Administrador principal del sistema de gestión hotelera"
                        </p>

                        <div className="flex justify-center w-full pt-6 border-t border-gray-100 gap-8">
                            <div className="text-center">
                                <span className="block text-lg font-bold text-gray-700">12</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Files</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-lg font-bold text-gray-700">2GB</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Used</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-lg font-bold text-gray-700">24.6$</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Spent</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Edit Form */}
                <Card title="Edit Profile" className="shadow-card border border-gray-100 lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <FormInput
                                    label="Company"
                                    name="company"
                                    value={formData.company}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <FormInput
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <FormInput
                                    label="Email address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <FormInput
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        {/* City Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                            <FormInput
                                label="Postal Code"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                type="number"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-xs uppercase text-gray-400 font-semibold mb-2 tracking-wider">
                                About Me
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-blue-400 transition-colors resize-none placeholder-gray-300"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                className="px-8 py-2.5 bg-cyan-400 text-white rounded-full hover:bg-cyan-500 transition-colors font-semibold text-sm tracking-wide shadow-md hover:shadow-lg transform active:scale-95 duration-150"
                            >
                                Update Profile
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default UserProfileView;
