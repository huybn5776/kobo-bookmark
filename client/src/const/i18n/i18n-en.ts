export const i18nEn = {
  common: {
    delete: 'Delete',
    delete_selected: 'Delete selected',
    export_selected: 'Export selected as json file',
    archive: 'Archive',
    archive_selected: 'Archive selected',
    cancel_archive: 'Cancel archive',
    archived: 'Archived',
    copy: 'Copy',
    close: 'Close',
    create: 'Create',
    cancel: 'Cancel',
    edit: 'Edit',
    save: 'Save',
    yes: 'Yes',
    enter: 'Enter',
    undo: 'Undo',
    filter: 'Filter',
    sorting: 'Sorting',
    search: 'search',
    state: 'State',
    loading: 'Loading…',
    link: 'Link',
    title: 'Title',
    description: 'Description',
    optional: 'Optional',
    more: 'More',
    instruction: 'Instruction',
    selected: 'Selected',
    clear_selection: 'Clear selection',
    pin: 'Pin',
    unpin: 'Unpin',
    book: 'book | books',
    books: 'books',
    bookmark: 'bookmark | bookmarks',
    highlight: 'highlight | highlights',
    number_minute: '{0} minute | {0} minutes',
    number_hour: '{0} hour | {0} hours',
    change_image: 'Change image',
    image_url: 'Image url',
    invalid_url: 'Invalid url.',
    invalid_url_format: 'Invalid url format.',
    cannot_get_response_from_url: 'Cannot get correct response from url.',
    connected: 'Connected',
    not_connected: 'Not connected',
    expired: 'Expired',
    no_matched: 'Not matched',
    notion_required: 'Notion settings required',
    notion_required_set_notice: 'This operation require Notion to be set, set it up now?',
    dropbox_required: 'Dropbox settings required',
    dropbox_required_set_notice: 'This operation require Dropbox to be set, set it up now?',
    re_connect_to_dropbox_notice: 'Dropbox connect is expired, please re-connect it at Settings page.',
    color: {
      default: 'Default',
      yellow: 'Yellow',
      red: 'Red',
      green: 'Green',
      blue: 'Blue',
      pink: 'Pink',
      purple: 'Purple',
    },
    copied_message: {
      '1': 'Copied!',
      '2': 'Double Copy!',
      '3': 'Triple Copy!',
      '4': 'Dominating!!',
      '5': 'Rampage!!',
      '6': 'Mega Copy!!',
      '7': 'Unstoppable!!',
      '8': 'Wicked Sick!!',
      '9': 'Monster Copy!!!',
      '10': 'GODLIKE!!!',
      '11': 'BEYOND GODLIKE!!!!',
    },
  },
  page_menu: {
    language: 'Language',
  },
  page_name: {
    import: 'Import',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
  },
  page: {
    home: {
      heading_title: 'Import, Export, Share',
      heading_description: `Extend {0} reader's bookmarks usage.`,
      demo: 'Demo',
      heading_try_now: 'Try now',
      notion_export_title: 'Notion export',
      notion_export_description: '"Freely" managing your highlight on Notion.',
      bookmark_search_title: 'Search',
      bookmark_search_description: 'Forgot about the source of some term? Find it out.',
      highlight_color_title: 'Color',
      highlight_color_description: 'Let exported highlight more colorful, without limit by monochrome reader.',
      bookmark_card_title: 'Card',
      bookmark_card_description: 'Easier to share your highlight with social media posts.',
      bookmark_share_title: 'Sharing',
      bookmark_share_description: `Share book's highlight with only a Dropbox connection needed.`,
      confirm_changes_title: 'Confirm changes',
      confirm_changes_description:
        'Make sure all bookmark is still present in your reader without disappeared for no reason.',
    },
    data_import: {
      instruction: 'Instruction',
      instruction_steps: {
        find_your_file: 'Find your {0} file under kobo reader storage at path {1} and drop it.',
        find_your_file_note: `If you can't find it due to it is hidden folder, you can still drop entire storage folder there to let website find it for you.`,
        website_resolve: `This website will resolve all highlight withing it, then try to find book's cover image from {0} and {1}.`,
        connect_notion:
          'If it looks ok at {0} page, connect your Notion account in {1} page and than go back to {0} page export it.',
      },
      drop_file: 'Drop {0} file, entire kobo storage or exported books json file here',
      drop_reimport: 'Drop file to re-import',
      no_target_file: `No target sqlite or json file found in dropped files.`,
      error_parsing: 'Error when parsing bookmarks',
      bookmark_changes: 'Bookmark changes',
      changed: 'changed',
      no_change: 'No change',
      discard_changes: 'Discard changes',
      save_changes: 'Save changes',
      export_changes: 'Export changes…',
      as_text_file: 'As text file',
      as_text_clipboard: 'As text to clipboard',
      as_markdown_file: 'As Markdown file',
      as_markdown_clipboard: 'As Markdown to clipboard',
      no_changes_to_export: 'No changes to export',
      bookmark_copied: 'Bookmarks of {0} book has copied to clipboard | Bookmarks of {0} books has copied to clipboard',
      imported_book: 'book | books',
      imported_bookmark: 'bookmark | bookmarks',
      book_absent: 'Book absent',
      added: '{0} added',
      updated: '{0} updated',
      removed: '{0} removed',
      added_tag: 'Added',
      updated_tag: 'Updated',
      removed_tag: 'Removed',
    },
    bookmarks: {
      loading_books: 'Loading books…',
      empty_bookmarks1: `There is no bookmark here yet,`,
      empty_bookmarks2: `try to {0} some?`,
      no_matching_bookmarks: 'No matching bookmarks.',
      sort_books_by: 'Sort books by:',
      sort_bookmarks_by: 'Sort bookmarks by:',
      last_bookmarked_time: 'Last bookmarked time',
      last_update: 'Last update',
      last_added: 'Last added',
      book_name: 'Book name',
      author: 'Author',
      series: 'Series',
      position: 'Position',
      bookmarks_count: 'Bookmarks count',
      read_time: 'Read time',
      change_cover_image: 'Change cover image',
      not_image_url: 'This is not the url of image.',
      cover_image_updated: 'Cover image updated.',
      share_dropbox: 'Create share link with Dropbox',
      export_text: 'Export as text',
      export_all_text: 'Export all as text',
      export_markdown: 'Export as markdown',
      export_all_markdown: 'Export all as markdown',
      export_notion: 'Export to Notion',
      export_all_notion: 'Export all to Notion',
      book_archived: 'Book archived.',
      book_cancel_archived: 'Book cancel archived.',
      books_archived: `{0} @:{'common.book'} archived.`,
      bookmark_archived: 'Bookmark archived.',
      bookmark_cancel_archived: 'Bookmark cancel archived.',
      delete_book_with_bookmarks: `Delete book "{0}" with {1} @:{'common.bookmark'}?`,
      delete_multi_books: `Delete {0} @:common.book`,
      with_bookmarks: `with total {0} @:{'common.bookmark'}?`,
      create_bookmark_card: 'Share with bookmark card',
      edit_bookmark_instruction: 'Format: Press {0} after selected text and save to highlight.',
      revert_highlight: 'Revert highlight back to its original text',
      font_size: 'Font size',
      shape: 'Shape',
      download_image: 'Download image',
      change_highlight_color: 'Change highlight color',
      exporting_books: 'Exporting {0} book | Exporting {0} books',
      book_exported: '{0} book exported | {0} books exported',
      book_failed: '{0} book failed | {0} books failed',
      book_canceled: '{0} book canceled | {0} books canceled',
      book_completed: '{0} book completed | {0} books completed',
      checking_target_page: 'Checking target page',
      creating_page: 'Creating page',
      updating_page: 'Updating page',
      adding_blocks: 'Adding content',
      cleanup_page: 'Cleanup old content',
      starting: 'Starting…',
      share_bookmarks: 'Share bookmarks',
      share_link_created: 'Share link created',
      link_copied: 'Link copied',
      shared_bookmarks: 'Shared bookmarks',
      bookmark_share_title: 'Share title',
      bookmark_share_description: 'Share description',
      dropbox_bookmark_share_invalid_share_link: 'Invalid bookmark share link.',
      dropbox_bookmark_share_not_available: 'This bookmarks share is not available.',
      dropbox_bookmark_share_invalid_format: 'The targeting dropbox file is not the correct bookmarks share file.',
      dropbox_bookmark_share_invalid_content: `The targeting dropbox file's content is invalid`,
    },
    settings: {
      title: 'Settings',
      text_export: {
        title: 'Text export settings',
        export_mode: 'Export mode',
        mode_list: 'List',
        mode_list_description: 'Show highlights by list, better for viewing large number of content.',
        mode_paragraph: 'Paragraph',
        mode_paragraph_description: 'Show highlight content by paragraph, allow more details to be displayed.',
      },
      markdown: {
        title: 'Markdown settings',
        export_mode: 'Export mode',
        mode_list: 'List',
        mode_list_description: 'Show highlights by list, better for viewing large number of content.',
        mode_paragraph: 'Paragraph',
        mode_paragraph_description: 'Show highlight content by paragraph, allow more details to be displayed.',
      },
      notion: {
        title: 'Notion settings',
        export_to: 'Export to',
        export_to_page: 'Page',
        export_to_page_description: 'Create new page to the end of connected page.',
        export_to_database: 'Database',
        export_to_database_description: 'Insert into connected database, that is better for filtering and sorting',
        export_to_auto: 'Auto',
        export_to_auto_description: 'Use the database first if available, otherwise use the page.',
        connected_page: 'Connected page',
        loading_nothing_more: 'There are nothing more',
        connected_database: 'Connected database ',
        integration_connect: 'Integration connect',
        notion_connect_description: `On the second page after redirection (that show the 'Allow access' button), please select 'Use a template…' option, or select a page previously created from template.`,
        connect_to_notion: 'Connect to Notion',
        clear_notion_connection: 'Clear Notion connection setting',
        connected_workspace: 'Connected workspace',
      },
      dropbox: {
        dropbox_connect: 'Dropbox connect',
        connect_to_dropbox: 'Connect to Dropbox',
        clear_dropbox_setting: 'Clear dropbox setting',
      },
      misc: {
        title: 'Misc',
        show_removed_book_when_importing: 'Show absent books on change list when importing from database file',
        show_archived: 'Show archived books and bookmarks',
        language: 'Language',
        language_auto: 'Browser default',
      },
      backup: {
        title: 'Data and backup',
        title_setting_value: 'Setting value',
        title_book_and_bookmarks: 'Book and bookmarks',
        export_all_settings: 'Export all settings',
        import_settings: 'Import settings',
        setting_applied: 'Settings applied',
        fail_to_import_settings: 'Fail to import settings',
        reset_all_settings: 'Reset all settings',
        confirm_reset_all_settings: 'Are you sure you want to reset all settings?',
        all_settings_reset: 'Settings has been reset.',
        export_all_books: 'Export all books',
        import_books: 'Import books',
        book_imported: '{0} @:common.book imported.',
        clear_all_books: 'Clear all books',
        confirm_clear_all_books: `Are you sure you want to clear all {0} @:{'common.book'}?`,
        clear_empty_books: `There is no any book to clear up.`,
        all_books_cleared: 'All books cleared.',
        fail_to_import_books: 'Fail to import books',
        invalid_book_data: 'There are error in book "{0}"',
        json_parse_error: `Selected file is not a valid json file.`,
        data_structure_error: `Selected file didn't sense like the right backup file.`,
      },
    },
  },
};
