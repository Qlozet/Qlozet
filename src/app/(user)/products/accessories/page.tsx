'use client';
import { useEffect, useState, useCallback } from 'react';
// Svg import starts
import addIcon from '@/public/assets/svg/add-square.svg';
import importIcon from '@/public/assets/svg/import.svg';
import shoppingBag from '@/public/assets/svg/shipping_bag.svg';

// Components import start
import DashboardTopCard from '@/components/DashboardTopCard';
import Typography from '@/components/Typography';
import Modal from '@/components/Modal';
import DonutChart from '@/components/Chat/DoughnutChat';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import DropDown from '@/components/DropDown';
import Image from 'next/image';

// stylse sheet
import classes from './index.module.css';

import { usePathname } from 'next/navigation';
import { useGetAllVendorProductsQuery } from '@/redux/services/products/products.api-slice';
import moment from 'moment';

// redux
import { useAppSelector } from '@/redux/store';
import { activeCheck } from '@/lib/utils';
import AccessoriesTable from '@/components/Products/AccessoriesTable';
import AddAcessories from '@/components/Products/Accessories';

const Products: React.FC = () => {
  const filterData = useAppSelector((state) => state.filter.state);
  const pathname = usePathname();
  const [showAddAccessoriesModal, setShowAddAccessoriesModal] = useState(true);
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetAllVendorProductsQuery();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProduct, setFilterdProduct] = useState<any[]>([]);
  const [activatedProduct, setActivatedProduct] = useState(0);
  const [tagData, setTagData] = useState({
    labels: ['Male', 'Female'],
    values: [0, 0],
    colors: ['#9C8578', '#3E1C01'],
    borderAlign: 'center',
  });
  const [page, setPage] = useState<string>('');

  const toggleStatus = () => {
    refetch();
  };

  // Process products data when it's available
  useEffect(() => {
    if (productsData?.data) {
      const productData: any[] = [];
      setActivatedProduct(
        productsData.data.data.filter((product: any) => product.status).length
      );
      productsData.data.data.map((product: any) => {
        const productStatus = activeCheck(product.status);
        const orderItem = {
          id: product._id,
          picture: product.images[0]?.secure_url
            ? product.images[0]?.secure_url
            : '',
          productName: product.name,
          productPrice: `₦${parseInt(product.price).toLocaleString()}`,
          category: 'Two Piece',
          productType: product.type,
          tag: product.tag,
          quiantity: product.quantity,
          ProductStatus: productStatus,
          createdAt: product.createdAt,
          variantCount: product.variants.length,
        };
        productData.push(orderItem);
      });
      setTagData((prevData) => {
        return {
          ...prevData,
          values: [
            productData.filter((prod) => prod.tag === 'male').length,
            productData.filter((prod) => prod.tag === 'female').length,
          ],
        };
      });
      setProducts(productData);
      setFilterdProduct(productData);
    }
  }, [productsData]);

  const handleFilterData = useCallback(
    (data: string) => {
      setFilterdProduct(
        products.filter(
          (pro) =>
            pro.productName.toLowerCase().includes(data.toLowerCase()) ||
            pro.category.toLowerCase().includes(data.toLowerCase()) ||
            pro.tag.toLowerCase().includes(data.toLowerCase())
        )
      );
    },
    [products]
  );

  const handleFilterWithDate = (startDate: number, endDate: number) => {
    setFilterdProduct(
      products.filter(
        (item) =>
          moment(item.createdAt).valueOf() >= startDate &&
          moment(item.createdAt).valueOf() <= endDate
      )
    );
  };

  const submitAcessories = async () => {};

  useEffect(() => {
    handleFilterData(filterData);
  }, [filterData, handleFilterData]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean).slice(1);
    const basePath = pathSegments.join('/').split('/')[0];
    const capitalizedPath =
      basePath.charAt(0).toUpperCase() + basePath.slice(1);
    setPage(capitalizedPath);
  }, [pathname]);
  return (
    <section>
      <div className='flex bg-[#F8F9FA]'>
        <div className='w-full px-4'>
          {isLoading ? (
            <Loader></Loader>
          ) : (
            <div>
              <div className='flex items-center justify-end py-4 gap-6'>
                <div className='block'>
                  <Button
                    btnSize='small'
                    variant='outline'
                    clickHandler={() => {
                      setShowAddAccessoriesModal(true);
                    }}
                  >
                    <span className='flex justify-center items-center '>
                      <span>Import</span>
                      <span className='hidden lg:block ml-[2px]'>
                        accessory
                      </span>
                      <Image src={importIcon} className='ml-4' alt='' />
                    </span>
                  </Button>
                </div>
                <div>
                  <Button
                    btnSize='small'
                    minWidth='lg:min-w-[14rem]'
                    variant='primary'
                    clickHandler={() => {
                      setShowAddAccessoriesModal(true);
                    }}
                  >
                    <span className='flex justify-center items-center'>
                      <span>New accessory</span>
                      <Image src={addIcon} className='ml-4' alt='' />
                    </span>
                  </Button>
                </div>
              </div>
              <div
                className={` ${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll`}
              >
                <DashboardTopCard
                  name='Total products'
                  total={products.length}
                  percentage='2.5'
                  bgColor='bg-[#57CAEB]'
                  icon={shoppingBag}
                  addMaxWidth={true}
                />
                <DashboardTopCard
                  name='Activated products'
                  total={activatedProduct}
                  percentage='2.5'
                  bgColor='bg-[#5DDAB4]'
                  icon={shoppingBag}
                  addMaxWidth={true}
                />
                <div
                  className={`px-6 py-4 flex bg-white rounded-[12px] mt-4 max-w-[300px] w-full min-w-[300px]`}
                >
                  <DonutChart data={tagData} width={'90'} height={'90'} />
                  <div>
                    <Typography
                      textColor='text-black'
                      textWeight='font-[400]'
                      textSize='text-xs'
                    >
                      Sales By Product Category
                    </Typography>
                    <div>
                      <div className='flex items-center gap-2 p-2'>
                        <span className='w-[10px] h-[10px] rounded-[50%] bg-primary'></span>
                        <Typography
                          textColor='text-black'
                          textWeight='font-[400]'
                          textSize='text-xs'
                        >
                          Female
                        </Typography>
                      </div>
                      <div className='flex items-center gap-2 p-2'>
                        <span className='w-[10px] h-[10px] rounded-[50%] bg-primary-200'></span>
                        <Typography
                          textColor='text-black'
                          textWeight='font-[400]'
                          textSize='text-xs'
                        >
                          Male
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className='relative'>
                  <div
                    className=' hidden lg:flex items-center justify-between mt-8 mb-2'
                    style={{ zIndex: '20' }}
                  >
                    <Typography
                      textColor='text-dark'
                      textWeight='font-bold'
                      textSize='text-[18px]'
                    >
                      {page}
                    </Typography>
                    <div className='relative' style={{ zIndex: 1 }}>
                      <DropDown
                        data={[
                          'This week',
                          'Last week',
                          'This month',
                          'Last month',
                          'Choose month',
                          'Custom',
                        ]}
                        maxWidth={'max-w-[8rem]'}
                        placeholder='Time Range'
                        setValue={(startDate, endDate) => {
                          handleFilterWithDate(startDate, endDate);
                        }}
                        // zIndex={100}
                      />
                    </div>
                  </div>
                </div>
                <AccessoriesTable
                  data={filteredProduct}
                  showModal={() => {}}
                  statusChangeHandler={toggleStatus}
                  handleFilterData={handleFilterData}
                  handleFilterWithDate={handleFilterWithDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        show={showAddAccessoriesModal}
        closeModal={() => setShowAddAccessoriesModal(false)}
        content={
          <>
            {showAddAccessoriesModal && (
              <AddAcessories
                submitAcessories={submitAcessories}
                closeModal={() => {
                  setShowAddAccessoriesModal(false);
                }}
              />
            )}
          </>
        }
      />
    </section>
  );
};

export default Products;
