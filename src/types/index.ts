// Common type definitions for the application

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormInputProps extends BaseComponentProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectInputProps extends FormInputProps {
  options: SelectOption[];
  multiple?: boolean;
  value?: string | number | string[] | number[];
  onChange?: (value: string | number | string[] | number[]) => void;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  images?: string[];
}

export interface Order {
  id: string;
  userId: string;
  products: Product[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// Customer Page Types
export interface CustomerData {
  customerId: string;
  picture?: string | undefined;
  customerName: string;
  status: string;
  totalOrders: number;
  lastOrderDate: string;
  phone: string;
  emailAddress: string;
  createdAt: string;
}

export interface RawCustomerData {
  customerId: string;
  picture?: string;
  firstName: string;
  lastName: string;
  status: string;
  totalOrders: number;
  lastOrderDate: string;
  phoneNumber: string;
  email: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

// User Profile Types
export interface UserDetails {
  personalName: string;
  businessName: string;
  profileImage: string;
  items: number;
  profit: number;
  averageRating: number;
  ratings: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
}

export interface ProfileProps {
  userDetails: UserDetails;
  showProfile: boolean;
  showProfileHandler: () => void;
}

// Product and Add Page Types
export interface ProductFormData {
  productName: string;
  productStatus: string;
  productTag: string[];
  productDes: string;
  category: string[];
  subCategory: string[];
  productType: string;
  pricing: string;
  discount: string;
  productImage: ProductImage[];
  styles: StyleVariant[];
}

export interface ProductImage {
  id: string;
  image: string;
  color: string;
  price: number;
  checked: boolean;
  quantity: number;
  size: string[];
  index: number;
  images?: string[];
}

export interface StyleVariant {
  id: string;
  price: number;
  color: string;
  images?: string[];
}

// Signup and Auth Types
export interface BusinessInfo {
  businessName: string;
  businessEmail: string;
  businessPhoneNumber: string;
  businessAddress: string;
}

export interface PersonalInfo {
  personalName: string;
  phoneName: string;
  nationalIdentityNumber: string;
}

export interface PasswordInfo {
  password: string;
  confirmPassword: string;
}

export interface SignupFormValidation {
  businessName: boolean;
  businessEmail: boolean;
  businessPhoneNumber: boolean;
  businessAddress: boolean;
  personalName: boolean;
  phoneName: boolean;
  nationalIdentityNumber: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export interface ValidatorResult {
  status: boolean;
  data: Partial<SignupFormValidation>;
  id?: string;
}

// Step Component Props
export interface Step1Props {
  formData: BusinessInfo;
  setFormData: React.Dispatch<React.SetStateAction<BusinessInfo>>;
  setRequiredFormData: React.Dispatch<
    React.SetStateAction<SignupFormValidation>
  >;
  requiredFormData: SignupFormValidation;
}

export interface Step2Props {
  formData: PersonalInfo;
  setFormData: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  requiredData: SignupFormValidation;
  setRequiredData: React.Dispatch<React.SetStateAction<SignupFormValidation>>;
}

export interface Step3Props {
  handleSelect: (files: File[]) => void;
  businessFiles: File[];
}

export interface Step4Props {
  handleSelect: (files: File[]) => void;
  businessLogo: File[];
}

export interface Step5Props {
  formData: PasswordInfo;
  setFormData: React.Dispatch<React.SetStateAction<PasswordInfo>>;
  setRequiredData: React.Dispatch<React.SetStateAction<SignupFormValidation>>;
  requiredData: SignupFormValidation;
}

// Signin Types
export interface SigninFormData {
  businessEmail: string;
  password: string;
}

export interface SigninFormValidation {
  businessEmail: boolean;
  password: boolean;
}

// Removed duplicate - using the one at the end of the file

// Password Reset Types
export interface ForgotPasswordData {
  businessEmail: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  token?: string;
}

// Add Product Types
export interface AddProductFormData {
  productName: string;
  productStatus: string;
  productTag: string[];
  productDes: string;
  category: string[];
  subCategory: string[];
  productType: string;
  pricing: string;
  discount: string;
  productImage: ProductImageUpload[];
  styles: StyleVariantUpload[];
}

export interface ProductImageUpload {
  secure_url: string;
  public_id: string;
  asset_id: string;
}

export interface StyleVariantUpload {
  id: string;
  price: number;
  color: string;
  images: ProductImageUpload[];
}

export interface AccessoryItem {
  image: string;
  id: string;
  price: number;
}

export interface VariantTableItem {
  id: string;
  price: number;
  color: string;
  checked: boolean;
  quantity: number;
  size: string[];
  index: number;
  images: {
    retained: string[];
    deleted?: string[];
  };
}

export interface PositionStyle {
  style?: any;
  position?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

// Auth Form Types
export interface SigninFormData {
  businessEmail: string;
  password: string;
}

export interface SigninFormValidation {
  businessEmail: boolean;
  password: boolean;
}

export interface ForgotPasswordFormData {
  businessEmail: string;
}

export interface ForgotPasswordFormValidation {
  businessEmail: boolean;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormValidation {
  password: boolean;
  confirmPassword: boolean;
}

export interface CreateNewPasswordFormData {
  newPassword: string;
  confirmNewPassword: string;
}

export interface CreateNewPasswordFormValidation {
  newPassword: boolean;
  confirmNewPassword: boolean;
}

export interface VerificationFormData {
  verificationCode: string;
}

export interface VerificationFormValidation {
  verificationCode: boolean;
}

// Auth API Response Types
export interface LoginResponse extends ApiResponse {
  data: {
    token: string;
    user?: User;
    [key: string]: any;
  };
}

export interface ValidationResult {
  status: boolean;
  data: { [key: string]: boolean };
  id?: string | undefined;
}
