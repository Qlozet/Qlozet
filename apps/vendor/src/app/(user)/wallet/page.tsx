'use client'
import { useState, useEffect, SetStateAction, Suspense } from 'react'
import DashboardTopCard from '@/components/DashboardTopCard'
import vendorIcon from '@/public/assets/svg/vendor-total.svg'
import customerIcon from '@/public/assets/svg/total-customer.svg'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import WalletTable from '@/components/Wallet/WalletTable'
import SetUpAltireWallet from '@/components/Wallet/SetUpAltireWallet'
import TransactionDetails from '@/components/Wallet/TransactionDetails'
import SendMoney from '@/components/Wallet/SendMoney'
import SendMoneyForm from '@/components/Wallet/SendMoneyForm'
import Beneficiary from '@/components/Wallet/Beneficiary'
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useGetBanksQuery,
} from '@/redux/services/wallet/wallet.api-slice'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import DropDown from '@/components/DropDown'
import moment from 'moment'
import { useAppSelector } from '@/redux/store'
import { walletStatusCheck } from '@/lib/utils'
const Wallet: React.FC = () => {
  const filterData = useAppSelector((state) => state.filter.state)

  const [setUpWalletWallet, setSetUpWalletWallet] = useState(false)
  const [showTransactiondetails, setShowTransactiondetails] = useState(false)
  const [showSendMoney, setShowSendMoney] = useState<string | boolean>('')
  const [transactionId, setransactionId] = useState('')
  const [filteredTransactionData, setFilteredTransactionData] = useState<any[]>(
    []
  )

  const { data: walletBalanceData, isLoading: isLoadingBalance } =
    useGetWalletBalanceQuery()

  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useGetWalletTransactionsQuery()

  const { data: banksData, isLoading: isLoadingBanks } = useGetBanksQuery()

  const [transactionData, setTransactionData] = useState<any[]>([])
  const walletBalance = walletBalanceData?.data || 0
  const allBanks = banksData?.data || []
  const totalAmountRecived = 0 // TODO: Add proper API endpoint for this
  const loadPage = isLoadingBalance || isLoadingTransactions || isLoadingBanks

  const handleShowViewDetailModal = () => {
    setShowTransactiondetails(true)
  }

import React from 'react';
import { WalletPageTemplate } from '@/pattern/wallet/templates/wallet-page-template';

const Wallet: React.FC = () => {
  return <WalletPageTemplate />;
};

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <Wallet />
    </Suspense>
  )
}
