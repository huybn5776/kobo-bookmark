export const i18nZhTw = {
  common: {
    delete: '刪除',
    delete_selected: '刪除選取',
    export_selected: '匯出選取的書本為 json 檔',
    archive: '封存',
    archive_selected: '封存選取',
    cancel_archive: '取消封存',
    archived: '已封存',
    copy: '複製',
    close: '關閉',
    create: '建立',
    cancel: '取消',
    edit: '編輯',
    save: '儲存',
    yes: '確認',
    enter: '輸入',
    undo: '還原',
    filter: '過濾',
    sorting: '排序',
    search: '搜尋',
    link: '連結',
    state: '狀態',
    loading: '載入中…',
    title: '標題',
    description: '描述',
    optional: '可選',
    name: '名稱',
    more: '更多',
    instruction: '說明',
    selected: '已選取',
    clear_selection: '清除選取',
    pin: '置頂',
    unpin: '取消置頂',
    book: '書',
    books: '書本',
    bookmark: '書籤',
    highlight: '劃線',
    number_minute: '{0} 分鐘',
    number_hour: '{0} 小時',
    change_image: '更換圖片',
    image_url: '圖片網址',
    invalid_url: '無效的網址',
    invalid_url_format: '網址格式錯誤',
    cannot_get_response_from_url: '無法從網址取得正確的回應',
    connected: '已連線',
    not_connected: '未連線',
    expired: '已過期',
    no_matched: '沒有符合的項目',
    notion_required: '需要 Notion 的設定',
    notion_required_set_notice: '需要設定過 Notion 才能執行這個動作，要現在設定嗎?',
    dropbox_required: '需要 Dropbox 的設定',
    dropbox_required_set_notice: '需要設定過 Dropbox 才能執行這個動作，要現在設定嗎?',
    re_connect_to_dropbox_notice: 'Dropbox 連線已失效，請在設定頁面重新設定 Dropbox 的連線',
    color: {
      default: '預設',
      yellow: '黃色',
      red: '紅色',
      green: '綠色',
      blue: '藍色',
      pink: '粉紅色',
      purple: '紫色',
    },
    copied_message: {
      '1': '已複製！',
      '2': '雙倍複製！',
      '3': '三倍複製！',
      '4': '主宰一切！！',
      '5': '狂爆攻擊！！',
      '6': '終極複製！！',
      '7': '無人能擋！！',
      '8': '變態殺戮！！',
      '9': '猛獸級複製！！！',
      '10': '超神的！！！',
      '11': '比神還強！！！！',
    },
  },
  page_menu: {
    language: '語系',
  },
  page_name: {
    import: '匯入',
    bookmarks: '書籤',
    settings: '設定',
  },
  page: {
    home: {
      heading_title: '匯入、匯出、分享',
      heading_description: '擴充 {0} 閱讀器劃線之更多可能性',
      demo: '範例',
      heading_try_now: '立即使用',
      notion_export_title: '匯出至 Notion',
      notion_export_description: '再也不需依賴付費的服務也能將劃線匯出至 Notion 管理',
      bookmark_search_title: '搜尋',
      bookmark_search_description: '快速找到某關鍵字出自於哪本讀過的書',
      bookmark_editing_title: '編輯',
      bookmark_editing_description: '強調劃線中的關鍵字',
      bookmark_card_title: '圖卡',
      bookmark_card_description: '更方便將劃線分享為貼文',
      bookmark_share_title: '分享',
      bookmark_share_description: '隨時與大家分享書本的劃線，僅需要連動至 Dropbox 的帳號',
      confirm_changes_title: '確認變更',
      confirm_changes_description: '更能確保劃線都有保存得好好的，沒有無故被消失',
    },
    data_import: {
      instruction: '說明',
      instruction_steps: {
        find_your_file: '在 {1} 路徑下找到 {0} 檔，並拖放到頁面上',
        find_your_file_note: `如果你找不到該檔案 (由於它是隱藏資料夾)，你可以選擇將整個閱讀器的磁碟拖放上來，讓網站自動幫你找`,
        website_resolve: `網站會解析其中的所有劃線，並試著從 {0} 以及 {1} 找到這本書相對應的封面圖`,
        connect_notion:
          '如果在 {0} 頁看起來一切看起來都很正常，可以在 {1} 頁面連結你的 Notion 帳號，並回到 {1} 頁來匯出',
      },
      drop_file: '將 {0} 檔案、整個裝置目錄或者已匯出的書本 json 檔拖放至此處',
      drop_reimport: '拖放檔案以重新匯入',
      no_target_file: `拖放的檔案中沒有目標的 sqlite 或者 json 檔`,
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
      book_absent: '書本不存在',
      added: '{0} 已新增',
      updated: '{0} 已更新',
      removed: '{0} 已刪除',
      added_tag: '新增',
      updated_tag: '更新',
      removed_tag: '刪除',
    },
    bookmarks: {
      loading_books: '書本載入中…',
      empty_bookmarks1: `這裡目前沒有任何書籤`,
      empty_bookmarks2: `試著 {0} 一些看看?`,
      collection: '收藏',
      create_collection: '建立收藏',
      edit_collection: '編輯收藏',
      no_selected_book: '沒有選取的書本',
      collection_name_is_required: '名稱為必填資訊',
      collection_name_duplicated: '名稱重複',
      collection_created: '已建立收藏 "{0}"',
      collection_updated: '已更新收藏 "{0}"',
      collection_deleted: '已刪除收藏 "{0}"',
      highlight_color: '劃線顏色',
      no_matching_bookmarks: '沒有符合的書籤',
      no_books_in_selected_book_collection: '書本收藏中沒有任何書',
      book_priority: '優先顯示書本',
      book_priority_none: '無',
      book_priority_started: '已加星號',
      sort_books_by: '書本排序',
      sort_bookmarks_by: '書籤排序',
      last_bookmarked_time: '最後加書籤時間',
      last_update: '最後更新',
      last_added: '最後新增',
      book_name: '書名',
      author: '作者',
      series: '系列',
      position: '位置',
      bookmarks_count: '書籤數量',
      read_time: '閱讀時間',
      change_cover_image: '更換封面圖片',
      not_image_url: '這不是圖片的網址',
      cover_image_updated: '封面圖片已更新',
      add_to_book_collection: '加至收藏',
      book_collection_already_contained_books: '這個收藏已經包含了所有選取的書',
      books_added_to_collection: '已新增 {0} 本書至收藏 "{1}"',
      remove_from_book_collection: '從收藏中移除',
      books_removed_from_collection: '已從收藏 "{1}" 中移除 {0} 本書',
      share_dropbox: '以 Dropbox 建立分享連結',
      export_text: '以文字匯出',
      export_all_text: '以文字匯出所有',
      export_markdown: '以 Markdown 匯出',
      export_all_markdown: '以 Markdown 匯出所有',
      export_notion: '匯出至 Notion',
      export_all_notion: '全部匯出至 Notion',
      book_archived: '已封存書本',
      book_cancel_archived: '已取消封存書本',
      books_archived: '已封存 {0} 本書',
      bookmark_archived: '已封存書籤',
      bookmark_cancel_archived: '已取消封存書籤',
      delete_book_with_bookmarks: `刪除書本 "{0}" 以及 {1} 個@:{'common.bookmark'}?`,
      delete_multi_books: '刪除 {0} 本書',
      with_bookmarks: `以及共 {0} 個@:{'common.bookmark'}?`,
      books_deleted: '已刪除 {0} 本書',
      create_bookmark_card: '以書籤圖卡分享',
      edit_bookmark_instruction: '格式: 選取文字後，按下 {0} 並儲存以強調顯示該文字',
      revert_highlight: '還原為原本的劃線文字',
      font_size: '字體大小',
      shape: '形狀',
      download_image: '下載圖檔',
      change_highlight_color: '更改劃線顏色',
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
      share_bookmarks: '分享書籤',
      share_link_created: '已建立分享連結',
      link_copied: '已複製連結',
      shared_bookmarks: '已分享的書籤',
      bookmark_share_title: '分享標題',
      bookmark_share_description: '分享描述',
      dropbox_bookmark_share_invalid_share_link: '無效的分享網址',
      dropbox_bookmark_share_not_available: '此分享無法使用',
      dropbox_bookmark_share_invalid_format: '分享所指定的 Dropbox 檔案並不是正確的檔案',
      dropbox_bookmark_share_invalid_content: '分享所指定的 Dropbox 檔案內容格式不正確',
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
        loading_nothing_more: '沒有更多了',
        connected_database: '連動的資料庫',
        integration_connect: '整合連線',
        notion_connect_description: `在跳轉過後的第二頁 'Allow access' 那邊，請選擇 'Use a template…' 選項，或選取先前建立的頁面`,
        connect_to_notion: '連線至 Notion',
        clear_notion_connection: '清除 Notion 的連線設定',
        connected_workspace: '已連線的 Workspace',
      },
      dropbox: {
        dropbox_connect: 'Dropbox 連線',
        connect_to_dropbox: '連線至 Dropbox',
        clear_dropbox_setting: '清除 Dropbox 設定',
      },
      misc: {
        title: '雜項',
        show_removed_book_when_importing: '從資料庫匯入書本資料時，於比較清單中顯示未存在於匯入檔中的書',
        show_archived: '顯示已封存的書本以及書籤',
        keep_the_last_selected_book_collection_when_opening_bookmarks_page: '開啟書籤頁面時，保持最後選取的書本收藏',
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
        settings_uploaded: '設定值已上傳',
        settings_loaded: '已載入設定值',
        no_backed_up_settings_on_dropbox: 'Dropbox 上沒有已備份的設定值',
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
        upload_to_dropbox: '上傳至 Dropbox',
        import_from_dropbox: '從 Dropbox 匯入',
        no_backed_up_books_on_dropbox: 'Dropbox 上沒有已備份的書檔',
        books_uploaded: '已上傳 {0} 本書',
      },
    },
  },
};
