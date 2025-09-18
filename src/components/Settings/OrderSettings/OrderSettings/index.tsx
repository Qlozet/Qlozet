import Typography from '@/components/Typography';
import DashedLine from '../dashedLine';
import ToggleSwitch from '@/components/Switch';
import { ChevronRight } from 'lucide-react';
import OrderSettingItem from '../OrderSettingItem';
import { useState } from 'react';

const OrderSetting = () => {
  const [generalSettings, setGeneralSettings] = useState([
    {
      id: '1',
      title: 'Order Confirmation',
      info: 'Enable/disable order confirmation',
      subInfo: ['Customize email templates'],
    },
    {
      id: '2',
      title: 'Order Notifications',
      info: 'Enable/disable order notification for specific events(e.g Order status)',
      subInfo: ['Customize notifications'],
    },
    {
      id: '3',
      title: 'Returns & Refunds',
      info: 'Enable/disable automatic refunds',
      subInfo: [
        'Set return & refund policies',
        'Configure return shipping labels',
      ],
    },
    {
      id: '4',
      title: 'Order Tracking',
      info: 'Enable/disable customer order tracking',
      subInfo: ['Integrate with shipping carriers for real-time updates'],
    },
  ]);

  const [orderConfirmationSettings, setOrderConfirmationSettings] = useState([
    {
      id: '1',
      title: 'Order Minimums & Maximums',
      info: '',
      subInfo: [
        'Set minimum & maximum order quantities',
        'Configure order value thresholds',
      ],
      checked: false,
    },
    {
      id: '2',
      title: 'Custom Order Options',
      info: 'Enable/disable custom order options(e.g add - ons, customization) ',
      subInfo: ['Set pricing & availability rules for custom options'],
      checked: false,
    },
    {
      id: '3',
      title: 'Order Bundles & Promos',
      info: '',
      subInfo: [
        'Create & manage product bundles with specific pricing & discounts',
      ],
      checked: false,
    },
    {
      id: '4',
      title: 'Order Tracking',
      info: 'Enable/disable automatic refunds',
      subInfo: [
        'Set return & refund policies',
        'Configure return shipping labels',
      ],
      checked: false,
    },
  ]);

  const [paymentAndTaxSettings, setPaymentSettings] = useState([
    {
      id: '1',
      title: 'Payment Methods',
      info: '',
      subInfo: ['Enable/disable payment methods', 'Configure payment gateways'],
      checked: false,
    },
    {
      id: '2',
      title: 'Tax Settings',
      info: '',
      subInfo: ['See tax rates and jurisdictions', 'Configure tax exemptions'],
      checked: false,
    },
    {
      id: '3',
      title: 'Pricing Rules',
      info: '',
      subInfo: [
        'Configure discounts & promotions',
        'Set pricing rules for different customer segments or order quantities',
      ],
      checked: false,
    },
  ]);

  const hnadleChangeSettings = (settings, id, value) => {
    if (settings === 'general') {
      setGeneralSettings(
        generalSettings.map((item) => {
          if (item.id === id) {
            return { ...item, checked: value };
          } else {
            return item;
          }
        })
      );
    } else if (settings === 'payment') {
      setPaymentSettings(
        paymentAndTaxSettings.map((item) => {
          if (item.id === id) {
            return { ...item, checked: value };
          } else {
            return item;
          }
        })
      );
    } else {
      setOrderConfirmationSettings(
        orderConfirmationSettings.map((item) => {
          if (item.id === id) {
            return { ...item, checked: value };
          } else {
            return item;
          }
        })
      );
    }
  };
  return (
    <div>
      <div className='px-4'>
        <div className='flex ga-4'>
          <DashedLine text={'General Order Settings'} />
          <DashedLine text={'Order Customization Settings'} />
        </div>
        <div className='flex gap-8 items-start'>
          {' '}
          <div className='flex-1'>
            <div className=' flex-col'>
              {generalSettings.map((item, index) => (
                <OrderSettingItem
                  {...item}
                  key={index}
                  onChange={(value) => {
                    hnadleChangeSettings('general', item.id, value);
                  }}
                />
              ))}
            </div>
          </div>
          <div className='flex-1'>
            <div className=' flex-col'>
              {orderConfirmationSettings.map((item, index) => (
                <OrderSettingItem
                  {...item}
                  key={index}
                  onChange={(value) => {
                    hnadleChangeSettings('order', item.id, value);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className='mt-24'>
        <DashedLine text={'Payment & Tax Settings'} position={'center'} />
        <div className='flex items-start'>
          <div className='flex flex-col flex-1'>
            {paymentAndTaxSettings.map((item, index) => (
              <OrderSettingItem
                {...item}
                key={index}
                onChange={(value) => {
                  hnadleChangeSettings('payment', item.id, value);
                }}
              />
            ))}
          </div>
          <div className='flex-1'></div>
        </div>
      </div>
    </div>
  );
};

export default OrderSetting;
