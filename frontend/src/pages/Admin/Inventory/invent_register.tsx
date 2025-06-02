import { useState, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "../../../components/breadcrums";
import Adminsidemenu from "../../../layouts/sidemenuAdmin";
import { FaTrashAlt } from "react-icons/fa";
import { MdImage } from "react-icons/md";

interface FormData {
  productName: string;
  category: string;
  ingredients: string;
  price: number;
  stock: number;
  description: string;
  size: string;
  sugarLevel: string;
  productCode: string;
  supplierName: string;
  photo?: File | null;
}

const initialFormData: FormData = {
  productName: "",
  category: "",
  ingredients: "",
  price: 0,
  stock: 0,
  description: "",
  size: "Medium",
  sugarLevel: "100%",
  productCode: "",
  supplierName: "",
  photo: null,
};

function MilkTeaRegistration() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string>("/src/assets/default-avatar.png");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setFormData({ ...formData, photo: file });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("/src/assets/default-avatar.png");
    setFormData({ ...formData, photo: null });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('product_name', formData.productName);
    form.append('category', formData.category);
    form.append('ingredients', formData.ingredients);
    form.append('price', String(formData.price));
    form.append('stock', String(formData.stock));
    form.append('description', formData.description);
    form.append('size', formData.size);
    form.append('sugar_level', formData.sugarLevel);
    form.append('user_id', '1'); // TODO: Replace with actual user ID from auth
    if (formData.photo) {
      form.append('image', formData.photo);
    }

    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (response.ok) {
        // Success: show toast or alert
        alert('Product created successfully!');
        setFormData(initialFormData);
        setImagePreview('/src/assets/default-avatar.png');
      } else {
        // Error: show error message
        alert(data.message || 'Failed to create product.');
      }
    } catch (error) {
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Adminsidemenu />

      {/* Blur overlay when modal is open */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm transition-all"></div>
      )}

      {/* Example Modal (replace with your actual modal) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-scaleIn">
            <h2 className="text-2xl font-bold mb-4">Example Modal</h2>
            <p className="mb-6">This is a sample modal. Replace with your own modal content.</p>
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className={`main-content app-content bg-gradient-to-r from-teal-300 via-pink-300 to-yellow-200 min-h-screen pt-8 ${modalOpen ? 'pointer-events-none select-none blur-sm' : ''}`}>
        <div className="container-fluid">
          <Breadcrumb
            title="Milk Tea Inventory Registration"
            links={[{ text: "Add Products", link: "/Inventory" }]}
            active="Register New Product"
          />

          <div className="grid grid-cols-12 gap-6">
            <div className="xxl:col-span-12 col-span-12">
              <div className="box rounded-2xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-md">
                <div className="box-body p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Product Image Upload */}
                    <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
                      <div className="w-40 h-40 rounded-full border-4 border-teal-300 overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-110">
                        <img
                          src={imagePreview}
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center items-center sm:items-start">
                        <label className="block text-lg font-semibold text-gray-800">Product Picture</label>
                        <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                          <label
                            className="bg-teal-400 text-white px-6 py-3 rounded-lg cursor-pointer text-base transition-all hover:bg-teal-500"
                            htmlFor="image-upload"
                          >
                            <MdImage className="inline-block mr-2" />
                            Upload
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <button
                            type="button"
                            className="bg-red-500 text-white px-6 py-3 rounded-lg text-base hover:bg-red-600"
                            onClick={handleRemoveImage}
                          >
                            <FaTrashAlt className="inline-block mr-2" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inventory Information */}
                    <div className="space-y-6">
                      <h2 className="text-3xl font-semibold text-teal-700 mb-6">Inventory Information</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Product Name</label>
                          <input
                            type="text"
                            name="productName"
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter Product Name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <select
                            name="category"
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="milktea">MILKTEA</option>
                            <option value="smoothie">SMOOTHIE</option>
                            <option value="iced tea">ICED TEA</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                          <textarea
                            name="ingredients"
                            rows={3}
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter ingredients"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <input
                            type="number"
                            name="price"
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter Price"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                          <input
                            type="number"
                            name="stock"
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter stock quantity"
                            required
                          />
                        </div>
                      </div>

                      {/* Product Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          rows={4}
                          onChange={handleChange}
                          className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter product description"
                          required
                        />
                      </div>

                      {/* Size, Sugar Level */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Size</label>
                          <select
                            name="size"
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            required
                          >
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Sugar Level</label>
                          <select
                            name="sugarLevel"
                            onChange={handleChange}
                            className="w-full mt-2 px-6 py-3 bg-gray-50 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
                            required
                          >
                            <option value="0%">0%</option>
                            <option value="50%">50%</option>
                            <option value="100%">100%</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-6 mt-8">
                      <button
                        type="reset"
                        className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
                        onClick={() => setFormData(initialFormData)}
                        disabled={isSubmitting}
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className={`${
                          isSubmitting ? "bg-gray-400" : "bg-teal-500"
                        } text-white px-6 py-3 rounded-lg hover:bg-teal-600`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Product"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MilkTeaRegistration;
