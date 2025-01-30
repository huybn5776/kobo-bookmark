<template>
  <div class="empty-bookmarks-message-container">
    <span class="empty-bookmarks-emoji">¯\_(ツ)_/¯</span>
    <span class="empty-bookmarks-message">
      <i18n-t keypath="page.bookmarks.empty_bookmarks1" />
    </span>
    <span class="empty-bookmarks-message">
      <i18n-t keypath="page.bookmarks.empty_bookmarks2">
        <router-link :to="{ name: 'import' }">
          <i18n-t keypath="page_name.import" />
        </router-link>
      </i18n-t>
    </span>
  </div>
</template>

<style lang="scss" scoped>
@forward './EmptyBookmarksView';
</style>
