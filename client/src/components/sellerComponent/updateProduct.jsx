import { API_BASE_URL } from '../../config/api.js';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavSellerCom from './NavSellerCom';

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

const editableFields = [
  'title',
  'description',
  'category',
  'price',
  'stock',
  'model',
  'caseMaterial',
  'dial',
  'bracelet',
  'movement',
  'power',
  'waterResestence',
  'crystal',
  'brand',
];

const numericFields = {
  price: { type: 'number', min: '0', step: '0.01', label: 'Price (INR)' },
  stock: { type: 'number', min: '0', step: '1', label: 'Stock quantity' },
  power: { type: 'number', min: '0', step: '1', label: 'Power reserve (hours)' },
  waterResestence: { type: 'number', min: '0', step: '1', label: 'Water resistance (meters)' },
};

const textFields = [
  { name: 'model', label: 'Model', placeholder: 'Model name or reference' },
  { name: 'caseMaterial', label: 'Case material', placeholder: 'e.g. Stainless steel' },
  { name: 'dial', label: 'Dial', placeholder: 'e.g. Black sunray' },
  { name: 'bracelet', label: 'Bracelet / strap', placeholder: 'e.g. Stainless steel bracelet' },
  { name: 'movement', label: 'Movement', placeholder: 'e.g. Automatic' },
  { name: 'crystal', label: 'Crystal', placeholder: 'e.g. Sapphire', required: false },
];

const inputClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 bg-[#fbfaf7] px-4 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10';

function UpdateProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
      return () => { active = false; };
    }

    const fetchProduct = async () => {
      setFetching(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/product/${productId}`, {
          headers: { Authorization: `bearer ${token}` },
        });
        const product = response.data;
        if (!product || typeof product !== 'object') {
          throw new Error('The product details response was not in the expected format.');
        }

        const editableData = Object.fromEntries(
          editableFields.map((field) => [field, product[field] ?? ''])
        );
        if (active) setFormData(editableData);
      } catch (requestError) {
        console.error('Could not load product for editing:', requestError);
        if (active) {
          setError(
            requestError.response?.data?.message ||
              'We could not load this listing. Please try again.'
          );
        }
      } finally {
        if (active) setFetching(false);
      }
    };

    fetchProduct();
    return () => { active = false; };
  }, [navigate, productId, refreshKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSaved(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const updateData = Object.fromEntries(
      editableFields.map((field) => [field, formData[field]])
    );
    setLoading(true);
    setSaved(false);
    setError('');

    try {
      const response = await axios.put(`${API_BASE_URL}/products/${productId}`, updateData, {
        headers: { Authorization: `bearer ${token}` },
      });
      setSaved(true);
      toast.success(response.data?.message || 'Listing updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      console.error('Could not update product listing:', requestError);
      setError(
        requestError.response?.data?.message ||
          'We could not save your changes. Check the details and try again.'
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
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">Edit listing</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Keep your product information accurate so shoppers know exactly what they’re viewing.
            </p>
          </div>

          {saved && (
            <div role="status" className="mt-7 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-medium"><FaCheck aria-hidden="true" /> Your listing changes have been saved.</p>
              <Link to="/myproducts" className="text-sm font-semibold underline underline-offset-4">Back to inventory</Link>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p>{error}</p>
              {!fetching && Object.keys(formData).length === 0 && (
                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  className="mt-2 font-semibold underline underline-offset-4"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {fetching ? (
            <div className="flex min-h-64 items-center justify-center" role="status">
              <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-900" />
                Loading listing details…
              </div>
            </div>
          ) : Object.keys(formData).length > 0 && (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="01" title="The essentials" description="Update the listing identity, price, and available stock." />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field name="title" label="Listing title" required>
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} maxLength="120" required className={inputClass} />
                  </Field>
                  <Field name="model" label="Model" required>
                    <input id="model" name="model" type="text" value={formData.model} onChange={handleChange} required className={inputClass} />
                  </Field>
                  <Field name="brand" label="Brand" required>
                    <select id="brand" name="brand" value={formData.brand} onChange={handleChange} required className={inputClass}>
                      <option value="">Select a brand</option>
                      {!brands.includes(formData.brand) && formData.brand && <option value={formData.brand}>{formData.brand}</option>}
                      {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                  </Field>
                  <Field name="category" label="Category" required>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
                      <option value="">Select a category</option>
                      {!categories.includes(formData.category) && formData.category && <option value={formData.category}>{formData.category}</option>}
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </Field>
                  <Field name="price" label={numericFields.price.label} required>
                    <div className="relative">
                      <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-500">₹</span>
                      <input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required className={`${inputClass} pl-9`} />
                    </div>
                  </Field>
                  <NumericField name="stock" value={formData.stock} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <Field name="description" label="Description" required>
                      <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" maxLength="2000" required className={`${inputClass} resize-y`} />
                    </Field>
                    <p className="mt-1 text-right text-xs text-stone-400">{String(formData.description || '').length}/2000</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="02" title="Watch specifications" description="Correct any technical details that have changed." />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {textFields.map((field) => (
                    <Field key={field.name} {...field}>
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required !== false}
                        className={inputClass}
                      />
                    </Field>
                  ))}
                  <NumericField name="power" value={formData.power} onChange={handleChange} />
                  <NumericField name="waterResestence" value={formData.waterResestence} onChange={handleChange} />
                </div>
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
                      Saving changes…
                    </>
                  ) : (
                    <>Save changes <FaCheck aria-hidden="true" size={13} /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

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

Field.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

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

SectionHeading.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

function NumericField({ name, value, onChange }) {
  const config = numericFields[name];
  return (
    <Field name={name} label={config.label} required>
      <input
        id={name}
        name={name}
        type={config.type}
        min={config.min}
        step={config.step}
        value={value}
        onChange={onChange}
        required
        className={inputClass}
      />
    </Field>
  );
}

NumericField.propTypes = {
  name: PropTypes.oneOf(['stock', 'power', 'waterResestence']).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default UpdateProductForm;
