export const i18nZhTw = {
  common: {
    delete: '刪除',
    delete_selected: '刪除選取',
    cancel: '取消',
    yes: '確認',
    enter: '輸入',
    clear_selection: '清除選取',
    book: '書',
    bookmark: '書籤',
    highlight: '劃線',
    number_minute: '{0} 分鐘',
    number_hour: '{0} 小時',
    change_image: '更換圖片',
    image_url: '圖片網址',
    invalid_url: '無效的網址',
    invalid_url_format: '網址格式錯誤',
    cannot_get_response_from_url: '無法從網址取得正確的回應',
  },
  page_name: {
    import: '匯入',
    bookmarks: '書籤',
    settings: '設定',
  },
  page: {
    home: {
      title: '匯出書籤步驟',
      goto_page: '移至 {0} 頁面',
      find_your_file: '在 {1} 路徑下找到 {0} 檔，並拖放到頁面上',
      find_your_file_note: `如果你找不到該檔案 (由於它是隱藏資料夾)，你可以選擇將整個閱讀器的磁碟拖放上來，讓網站自動幫你找`,
      website_resolve: `網站會解析其中的所有劃線，並試著從 {0} 以及 {1} 找到這本書相對應的封面圖`,
      connect_notion: '如果在 {0} 頁看起來一切看起來都很正常，可以在 {1} 頁面連結你的 Notion 帳號，並回到 {1} 頁來匯出',
    },
    data_import: {
      drop_file: '將 {0} 檔案或者整個裝置目錄拖放至此處',
      drop_reimport: '拖放檔案以重新匯入',
      no_sql_file: `拖放的檔案中沒有 "KoboReader.sqlite" 這個檔案`,
      error_parsing: '解析書籤時發生錯誤',
      bookmark_changes: '書籤變更',
      changed: '已變更',
      no_change: '沒有變更',
      discard_changes: '忽略變更',
      save_changes: '儲存變更',
      export_changes: '匯出變更…',
      as_text_file: '為文字檔案',
      as_text_clipboard: '為文字至剪貼薄',
      as_markdown_file: '為 Markdown 檔案',
      as_markdown_clipboard: '為 Markdown 至剪貼薄',
      bookmark_copied: '已複製 {0} 本書的書籤至剪貼薄',
      no_changes_to_export: '沒有可匯出的變更',
      imported_book: '本書',
      imported_bookmark: '個書籤',
      added: '{0} 已新增',
      updated: '{0} 已更新',
      removed: '{0} 已刪除',
      added_tag: '新增',
      updated_tag: '更新',
      removed_tag: '刪除',
    },
    bookmarks: {
      empty_bookmarks1: `這裡目前沒有任何書籤`,
      empty_bookmarks2: `試著 {0} 一些看看?`,
      sort_books_by: '書本排序:',
      sort_bookmarks_by: '書籤排序:',
      last_bookmarked_time: '最後加書籤時間',
      last_update: '最後更新',
      last_added: '最後新增',
      book_name: '書名',
      author: '作者',
      series: '系列',
      position: '位置',
      read_time: '閱讀時間',
      book_selected: '已選取 {0} 本書',
      change_cover_image: '更換封面圖片',
      not_image_url: '這不是圖片的網址',
      cover_image_updated: '封面圖片已更新',
      export_text: '以文字匯出',
      export_all_text: '以文字匯出所有',
      export_markdown: '以 Markdown 匯出',
      export_all_markdown: '以 Markdown 匯出所有',
      export_notion: '匯出至 Notion',
      export_all_notion: '全部匯出至 Notion',
      connect_to_notion_notice: '請先至設定頁面整合 Notion 的連線設定',
      delete_book_with_bookmarks: `刪除書本 "{0}" 以及 {1} 個@:{'common.bookmark'}?`,
      delete_multi_books: '刪除 {0} 本書',
      with_bookmarks: `以及共 {0} 個@:{'common.bookmark'}?`,
      exporting_books: '正在匯出 {0} 本書',
      book_exported: '已匯出 {0} 本書',
      book_failed: '{0} 本書已失敗',
      book_canceled: '{0} 本書已取消',
      book_completed: '{0} 本書已完成',
      checking_target_page: '檢查目標頁面',
      creating_page: '建立頁面',
      updating_page: '更新頁面',
      adding_blocks: '寫入內容',
      cleanup_page: '清除舊內容',
      starting: '開始中…',
    },
    settings: {
      title: '設定',
      text_export: {
        title: '文字匯出設定',
        export_mode: '匯出模式',
        mode_list: '清單',
        mode_list_description: '以清單列舉劃線內容，適合同時檢視大量劃線',
        mode_paragraph: '段落',
        mode_paragraph_description: '以段落顯示劃線內容，以顯示更詳細的內容',
      },
      markdown: {
        title: 'Markdown 設定',
        export_mode: '匯出模式',
        mode_list: '清單',
        mode_list_description: '以清單列舉劃線內容，適合同時檢視大量劃線',
        mode_paragraph: '段落',
        mode_paragraph_description: '以段落顯示劃線內容，以顯示更詳細的內容',
      },
      notion: {
        title: 'Notion 設定',
        export_to: '匯出至',
        export_to_page: '頁面',
        export_to_page_description: '在連動的頁面末端建立新的子頁面',
        export_to_database: '資料庫 (Database)',
        export_to_database_description: '新增至連動頁面的資料庫，更適合作篩選以及排序',
        export_to_auto: '自動',
        export_to_auto_description: '優先使用資料庫，若資料庫不存在才使用頁面',
        connected_page: '連動的頁面',
        loading: '載入中…',
        loading_nothing_more: '沒有更多了',
        connected_database: '連動的資料庫',
        integration_connect: '整合連線',
        notion_connect_description: `在跳轉過後的第二頁 'Allow access' 那邊，請選擇 'Use a template…' 選項，或選取先前建立的頁面`,
        connect_to_notion: '連線至 Notion',
        clear_notion_connection: '清除 Notion 的連線設定',
        connected_workspace: '已連線的 Workspace',
      },
      misc: {
        title: '雜項',
        language: '語言',
        language_auto: '瀏覽器預設',
      },
      backup: {
        title: '資料與備份',
        title_setting_value: '設定值',
        title_book_and_bookmarks: '書本以及書籤',
        export_all_settings: '匯出所有設定',
        import_settings: '匯入設定',
        setting_applied: '已套用匯入的設定',
        fail_to_import_settings: '匯入設定失敗',
        reset_all_settings: '重置所有設定',
        confirm_reset_all_settings: '你確定要清除所有的設定?',
        all_settings_reset: '已重置所有的設定',
        export_all_books: '匯出所有書本',
        import_books: '匯入書本',
        book_imported: '已匯入 {0} 本書',
        clear_all_books: '清除所有書本',
        confirm_clear_all_books: '你確定要清除所有共 {0} 本的書書?',
        clear_empty_books: '沒有任何書可以清理的',
        all_books_cleared: '已清除所有書本',
        fail_to_import_books: '書本匯入失敗',
        invalid_book_data: '書本 "{0}" 中的資料有誤',
        json_parse_error: '選取的檔案不是有效的 json 檔',
        data_structure_error: '選取的檔案似乎不是正確的備份檔',
      },
    },
  },
};
