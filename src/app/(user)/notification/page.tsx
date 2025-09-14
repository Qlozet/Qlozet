"use client";
import React from "react";
import { useGetNotificationsQuery } from "@/redux/services/notification/notification.api-slice";
import Notification from "@/components/Notification/NotificationComponent";
import Loader from "@/components/Loader";
import Typography from "@/components/Typography";
const NotificationPage: React.FC = () => {
  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery({});

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <section>
        <div className="flex mt-4">
          <div className="w-full px-4">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <p className="text-red-500">Error loading notifications</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex mt-4">
        <div className="w-full px-4">
          <div className="rounded-[12px] overflow-hidden">
            <div className="p-2 flex items-center justify-between mt-4 lg:mb-4 bg-[#F4F4F4] rounded-t-[12px] lg:hidden">
              <Typography
                textColor="text-[#121212]"
                textWeight="font-medium"
                textSize="text-[14px]"
              >
                Notifications ({notifications.length})
              </Typography>
            </div>
            <div className="bg-white">
              {notifications.length > 0 ? (
                notifications.map((item, index) => (
                  <Notification
                    key={item.id || index}
                    id={item.id}
                    read={item.read}
                    title={item.title}
                    desc={item.description}
                    date={item.createdAt}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No notifications found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationPage;
