'use client';

import { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  createLiveChatColumns,
  type LiveChatLog,
} from '../molecules/live-chat-columns';
import { LiveChatConversation } from './live-chat-conversation';
import { readField } from '../lib/ticket-fields';

const PAGE_SIZE = 8;

export const LiveChatTable = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  // TODO(api): the backend has no live-chat endpoint. Replace this with
  // `useGetLiveChatLogsQuery({ page, size, search })` once it ships; the
  // columns, row drawer and table layout below are already built.
  const rows: LiveChatLog[] = useMemo(() => [], []);

  const openChat = (row: LiveChatLog) =>
    NiceModal.show(LiveChatConversation, {
      name: readField(row, 'user_name', 'vendor_name', 'customer_name'),
    });
  const columns = useMemo(() => createLiveChatColumns(), []);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isSuccess
      pagination={pagination}
      setPagination={setPagination}
      pageCount={1}
      onRowClick={openChat}
      emptyMessage="Live chat logs aren't available yet."
      toolbar={
        // No date filter or export: there is no chat data source to act on.
        <TableToolbar
          title="Live Chats"
          search={search}
          onSearchChange={setSearch}
          showFilter={false}
          showExport={false}
        />
      }
    />
  );
};
