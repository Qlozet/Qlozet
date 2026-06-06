'use client';

import { useMemo, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import type { PaginationState } from '@tanstack/react-table';
import { WorkInProgressModal } from '@/pattern/common/organisms/work-in-progress-modal';
import { DataTable } from '@/pattern/common/organisms/table/data-table';
import { TableToolbar } from '@/pattern/common/molecules/table-toolbar';
import {
  createLiveChatColumns,
  type LiveChatLog,
} from '../molecules/live-chat-columns';
import { LiveChatConversation } from './live-chat-conversation';
import { readName } from '../lib/ticket-fields';
import { USE_SUPPORT_MOCKS, MOCK_LIVE_CHATS } from '../lib/mock-data';

const PAGE_SIZE = 8;

export const LiveChatTable = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');

  // TODO(api): the backend has no live-chat endpoint yet. Replace this dataset
  // with `useGetLiveChatLogsQuery({ page, size, search })` once it ships; the
  // columns + table layout are ready. (Mock rows shown while USE_SUPPORT_MOCKS.)
  const rows: LiveChatLog[] = USE_SUPPORT_MOCKS ? MOCK_LIVE_CHATS : [];

  const showWip = () => NiceModal.show(WorkInProgressModal);
  const openChat = (row: LiveChatLog) =>
    NiceModal.show(LiveChatConversation, { name: readName(row) });
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
        <TableToolbar
          title="Live Chats"
          search={search}
          onSearchChange={setSearch}
          onFilterDate={showWip}
          onExport={showWip}
        />
      }
    />
  );
};
