import { API_BASE_URL } from '../../config/api.js';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaArrowLeft, FaCheck, FaImage, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavSellerCom from './NavSellerCom';

const initialFormData = {
  title: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  model: '',
  caseMaterial: '',
  dial: '',
  bracelet: '',
  movement: '',
  power: '',
  waterResestence: '',
  crystal: '',
  brand: '',
  product_images: [],
};

const categories = [
  'Luxury Watches',
  'Sport Watches',
  "Diver's Watches",
  'Pilot/Aviation Watches',
  'Field Watches',
  'GMT/World Time Watches',
  'Chronograph Watches',
  'Smart Watches',
  'Fashion Watches',
];

const brands = [
  'Rolex', 'Patek Philippe', 'Omega', 'Cartier', 'IWC Schaffhausen', 'Titan',
  'Casio', 'Audemars Piguet', 'TAG Heuer', 'Breitling', 'Panerai', 'Seiko',
  'Hamilton', 'Tissot', 'Longines', 'Jaeger-LeCoultre', 'Hublot',
  'Vacheron Constantin', 'Breguet', 'Bell & Ross', 'Montblanc', 'Blancpain',
  'Zenith', 'Fossil', 'Michael Kors', 'Daniel Wellington',
];

const identityFields = [
  { name: 'title', label: 'Listing title', placeholder: 'e.g. Classic automatic steel watch', required: true },
  { name: 'model', label: 'Model', placeholder: 'Model name or reference', required: true },
];

const specificationFields = [
  { name: 'caseMaterial', label: 'Case material', placeholder: 'e.g. Stainless steel', required: true },
  { name: 'dial', label: 'Dial', placeholder: 'e.g. Black sunray', required: true },
  { name: 'bracelet', label: 'Bracelet / strap', placeholder: 'e.g. Stainless steel bracelet', required: true },
  { name: 'movement', label: 'Movement', placeholder: 'e.g. Automatic', required: true },
  { name: 'power', label: 'Power reserve (hours)', type: 'number', min: '0', step: '1', required: true },
  { name: 'waterResestence', label: 'Water resistance (meters)', type: 'number', min: '0', step: '1', required: true },
  { name: 'crystal', label: 'Crystal', placeholder: 'e.g. Sapphire', required: false },
];

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please try another image.`));
    reader.readAsDataURL(file);
  });
}

function AddProduct() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error('Use JPG, PNG, or WebP images no larger than 2 MB each.');
    }
    if (acceptedFiles.length === 0) return;

    const availableSlots = Math.max(0, 5 - formData.product_images.length);
    if (availableSlots === 0) {
      toast.error('You have reached the 5-image limit.');
      return;
    }
    if (acceptedFiles.length > availableSlots) {
      toast.error(`You can add ${availableSlots} more ${availableSlots === 1 ? 'image' : 'images'}.`);
    }

    try {
      const newImages = await Promise.all(
        acceptedFiles.slice(0, availableSlots).map(readImage)
      );
      setFormData((current) => ({
        ...current,
        product_images: [...current.product_images, ...newImages].slice(0, 5),
      }));
      setCreated(false);
      setError('');
    } catch (readError) {
      console.error('Could not read product image:', readError);
      toast.error(readError.message);
    }
  }, [formData.product_images.length]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    maxFiles: 5,
    maxSize: 2 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setCreated(false);
    setError('');
  };

  const removeImage = (indexToRemove) => {
    setFormData((current) => ({
      ...current,
      product_images: current.product_images.filter((_, index) => index !== indexToRemove),
    }));
    setCreated(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.product_images.length === 0) {
      setError('Add at least one product image before publishing.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/product`, formData, {
        headers: { Authorization: `bearer ${token}` },
      });
      setFormData(initialFormData);
      setCreated(true);
      toast.success('Your watch listing is live.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      console.error('Could not create product listing:', requestError);
      setError(
        requestError.response?.data?.message ||
          'We could not publish this listing. Check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavSellerCom />
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f6f2] px-4 py-9 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Link to="/myproducts" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
            <FaArrowLeft aria-hidden="true" size={12} /> Back to inventory
          </Link>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Seller workspace</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">List a watch</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Share the details buyers need to discover your watch. Fields marked with an asterisk are required.
            </p>
          </div>

          {created && (
            <div role="status" className="mt-7 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-medium"><FaCheck aria-hidden="true" /> Your listing was created successfully.</p>
              <Link to="/myproducts" className="text-sm font-semibold underline underline-offset-4">View inventory</Link>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading number="01" title="The essentials" description="Give your watch a clear identity and set its price." />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {identityFields.map((field) => (
                  <Field key={field.name} {...field}>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      maxLength="120"
                      className={inputClass}
                    />
                  </Field>
                ))}
                <Field name="brand" label="Brand" required>
                  <select id="brand" name="brand" value={formData.brand} onChange={handleChange} required className={inputClass}>
                    <option value="">Select a brand</option>
                    {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </Field>
                <Field name="category" label="Category" required>
                  <select id="category" name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
                    <option value="">Select a category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </Field>
                <Field name="price" label="Price (INR)" required>
                  <div className="relative">
                    <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-500">₹</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>
                <Field name="stock" label="Stock quantity" required>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Number of watches available"
                    required
                    className={inputClass}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field name="description" label="Description" required>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the condition, design, and details buyers should know."
                      rows="4"
                      maxLength="2000"
                      required
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                  <p className="mt-1 text-right text-xs text-stone-400">{formData.description.length}/2000</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading number="02" title="Watch specifications" description="Add precise details to help shoppers compare watches." />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {specificationFields.map((field) => (
                  <Field key={field.name} {...field}>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      min={field.min}
                      step={field.step}
                      required={field.required}
                      className={inputClass}
                    />
                  </Field>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading number="03" title="Product photos" description="Add up to five clear images. JPG, PNG, and WebP files up to 2 MB each." />
              <div
                {...getRootProps()}
                className={`mt-6 rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                  isDragActive ? 'border-emerald-800 bg-emerald-50' : 'border-stone-300 bg-[#fbfaf7] hover:border-emerald-800'
                }`}
              >
                <input {...getInputProps()} aria-label="Upload product images" />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-900 shadow-sm">
                  <FaImage aria-hidden="true" size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold text-stone-900">
                  {isDragActive ? 'Drop your images here' : 'Drag and drop your watch photos'}
                </p>
                <p className="mt-1 text-xs text-stone-500">Show the watch from multiple angles.</p>
                <button
                  type="button"
                  onClick={open}
                  disabled={formData.product_images.length >= 5}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaPlus aria-hidden="true" /> Choose images
                </button>
                <p className="mt-3 text-xs text-stone-400">{formData.product_images.length} of 5 images added</p>
              </div>

              {formData.product_images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {formData.product_images.map((image, index) => (
                    <div key={`${index}-${image.slice(-24)}`} className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                      <img src={image} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-stone-800">
                          Cover image
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-700 shadow-sm transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        <FaTimes aria-hidden="true" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link to="/myproducts" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-700 transition hover:border-stone-500">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-7 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Publishing listing…
                  </>
                ) : (
                  <>Publish watch listing <FaCheck aria-hidden="true" size={13} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

const inputClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-[#fbfaf7] px-4 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10';

function Field({ name, label, required, children }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-stone-800">
        {label}{required && <span className="ml-1 text-rose-700" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-950">{number}</span>
      <div>
        <h2 className="font-serif text-xl font-semibold text-stone-950">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
      </div>
    </div>
  );
}

Field.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

SectionHeading.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default AddProduct;
