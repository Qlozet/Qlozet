'use client';
import { useState, useEffect } from 'react';
import DashboardTopCard from '@/components/DashboardTopCard';
import vendorIcon from '@/public/assets/svg/vendor-total.svg';
import customerIcon from '@/public/assets/svg/total-customer.svg';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import WalletTable from '@/components/Wallet/WalletTable';
import SetUpAltireWallet from '@/components/Wallet/SetUpAltireWallet';
import TransactionDetails from '@/components/Wallet/TransactionDetails';
import SendMoney from '@/components/Wallet/SendMoney';
import SendMoneyForm from '@/components/Wallet/SendMoneyForm';
import Beneficiary from '@/components/Wallet/Beneficiary';
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useGetBanksQuery,
} from '@/redux/services/wallet/wallet.api-slice';
import Loader from '@/components/Loader';
import Typography from '@/components/Typography';
import DropDown from '@/components/DropDown';
import moment from 'moment';
import { useAppSelector } from '@/redux/store';
import { walletStatusCheck } from '@/lib/utils';
const Wallet: React.FC = () => {
  const filterData = useAppSelector((state) => state.filter.state);

  const [setUpWalletWallet, setSetUpWalletWallet] = useState(false);
  const [showTransactiondetails, setShowTransactiondetails] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState('');
  const [transactionId, setransactionId] = useState('');
  const [filteredTransactionData, setFilteredTransactionData] = useState<any[]>(
    []
  );

  const { data: walletBalanceData, isLoading: isLoadingBalance } =
    useGetWalletBalanceQuery();

  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useGetWalletTransactionsQuery();

  const { data: banksData, isLoading: isLoadingBanks } = useGetBanksQuery();

  const [transactionData, setTransactionData] = useState<any[]>([]);
  const walletBalance = walletBalanceData?.data || 0;
  const allBanks = banksData?.data || [];
  const totalAmountRecived = 0; // TODO: Add proper API endpoint for this
  const loadPage = isLoadingBalance || isLoadingTransactions || isLoadingBanks;

  const handleShowViewDetailModal = () => {
    setShowTransactiondetails(true);
  };

  const showRejectModal = () => {
    // TODO: Implement reject modal functionality
  };

  const handleFilterData = (data: string) => {
    setFilteredTransactionData(
      transactionData.filter(
        (tansact) =>
          tansact.narration.toLowerCase().includes(data.toLowerCase()) ||
          tansact.transactionType.toLowerCase().includes(data.toLowerCase()) ||
          tansact.transactionId.toLowerCase().includes(data.toLowerCase())
      )
    );
  };

  const handleFilterWithDate = (startDate: number, endDate: number) => {
    setFilteredTransactionData(
      transactionData.filter(
        (item) =>
          moment(item.createdAt).valueOf() >= startDate &&
          moment(item.createdAt).valueOf() <= endDate
      )
    );
  };
  // Process transactions data when it's available
  useEffect(() => {
    if (transactionsData?.data) {
      const transactionDataArray: any[] = [];
      transactionsData.data.data.map((item: any) => {
        const status = walletStatusCheck(item.status);
        const transactionItem = {
          transactionId: item?.transactionId,
          amount: `₦${parseInt(item?.amount).toLocaleString()}`,
          date: item?.date,
          narration: item.narration,
          status,
          transactionType: item.transType,
          createdAt: item.createdAt,
        };
        transactionDataArray.push(transactionItem);
      });
      setTransactionData(transactionDataArray);
      setFilteredTransactionData(transactionDataArray);
    }
  }, [transactionsData]);

  useEffect(() => {
    if (transactionData.length > 0) {
      handleFilterData(filterData);
    }
  }, [filterData, transactionData]);

  return (
    <section>
      <div className='flex bg-[#F8F9FA]'>
        <div className='w-full p-4'>
          {loadPage ? (
            <Loader></Loader>
          ) : (
            <div>
              <div className='flex justify-end items-center lg:hidden w-full'>
                <div className='items-start gap-6 pt-5 flex '>
                  <Button
                    btnSize='small'
                    variant='outline'
                    minWidth={'103px'}
                    clickHandler={() => {
                      setShowSendMoney('Send Money');
                    }}
                  >
                    Send money
                  </Button>
                  <Button
                    btnSize='small'
                    variant='primary'
                    minWidth={'103px'}
                    clickHandler={() => {
                      setSetUpWalletWallet(true);
                    }}
                  >
                    Fund wallet
                  </Button>
                </div>
              </div>
              <div className='flex justify-between'>
                <div className='flex flex-2 items-center gap-4 overflow-x-scroll scrollbar-hide'>
                  <DashboardTopCard
                    name='Wallet Balance'
                    total={walletBalance.toLocaleString()}
                    percentage='2.5'
                    bgColor='bg-[#57CAEB]'
                    icon={vendorIcon}
                    addMaxWidth={true}
                  />
                  <DashboardTopCard
                    name='Total Amount Received'
                    total={totalAmountRecived.toLocaleString()}
                    percentage='2.5'
                    bgColor='bg-[#5DDAB4]'
                    icon={customerIcon}
                    addMaxWidth={true}
                  />
                </div>
                <div className='items-start gap-6 pt-5 hidden lg:flex'>
                  <Button
                    btnSize='small'
                    variant='outline'
                    clickHandler={() => {
                      setShowSendMoney('Send Money');
                    }}
                  >
                    Send money
                  </Button>
                  <Button
                    btnSize='small'
                    variant='primary'
                    clickHandler={() => {
                      setSetUpWalletWallet(true);
                    }}
                  >
                    Fund wallet
                  </Button>
                </div>
              </div>
              <div className=''>
                <div className='lg:flex items-center justify-between mt-6 mb-2 hidden '>
                  <Typography
                    textColor='text-dark'
                    textWeight='font-bold'
                    textSize='text-[18px]'
                  >
                    Wallet History
                  </Typography>
                  <div className=''>
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
                    />
                  </div>
                </div>
                <WalletTable
                  data={filteredTransactionData}
                  viewDetails={(id) => {
                    setransactionId(id);
                    handleShowViewDetailModal();
                  }}
                  showRejectModal={showRejectModal}
                  handleFilterData={handleFilterData}
                />
              </div>
            </div>
          )}
        </div>

        <Modal
          show={setUpWalletWallet}
          content={
            <>
              {setUpWalletWallet && (
                <SetUpAltireWallet
                  closeModal={() => {
                    setSetUpWalletWallet(false);
                  }}
                />
              )}
            </>
          }
        ></Modal>
        <Modal
          show={showTransactiondetails}
          content={
            <>
              {showTransactiondetails && (
                <TransactionDetails
                  closeModal={() => {
                    setShowTransactiondetails(false);
                  }}
                  details={
                    transactionData.filter(
                      (item) => item.transactionId == transactionId
                    )[0]
                  }
                />
              )}
            </>
          }
        ></Modal>
        <Modal
          show={showSendMoney === 'Send Money' ? true : false}
          content={
            <>
              {showSendMoney === 'Send Money' && (
                <SendMoney
                  closeModal={(name) => {
                    setShowSendMoney(name);
                  }}
                />
              )}
            </>
          }
        ></Modal>

        <Modal
          show={showSendMoney === 'Manually' ? true : false}
          content={
            <>
              {showSendMoney && (
                <SendMoneyForm
                  banks={allBanks}
                  closeModal={() => {
                    setShowSendMoney(false);
                  }}
                />
              )}
            </>
          }
        ></Modal>

        <Modal
          show={showSendMoney === 'Beneficiaries'}
          content={
            showSendMoney === 'Beneficiaries' && (
              <Beneficiary
                closeModal={() => {
                  setShowSendMoney(false);
                }}
              />
            )
          }
        ></Modal>
      </div>
    </section>
  );
};

export default Wallet;
