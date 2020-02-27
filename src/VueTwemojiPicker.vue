<template>
  <div class="vue-twemoji-picker">
    <div class="vue-twemoji-picker__categories">
      <div
        v-bind:class="{ 'vue-twemoji-picker__category__current': currentCategory == 'recent', 'vue-twemoji-picker__category__unavailable': !availableCategories['recent'] }"
        class="vue-twemoji-picker__category"
        @click="categoryClick('recent')"
        v-if="recentEmojis.length > 0"
      >
        <div :title="recent" class="vue-twemoji-picker__emoji">
          <div :style="emojiStyle(emojiForCategory('recent'))" ></div>
        </div>
      </div>
      <div
        v-for="categoryName in Object.keys(categories)"
        v-bind:key="categoryName"
        v-bind:class="{ 'vue-twemoji-picker__category__current': currentCategory == categoryName, 'vue-twemoji-picker__category__unavailable': !availableCategories[categoryName] }"
        class="vue-twemoji-picker__category"
        @click="categoryClick(categoryName)"
      >
        <div :title="categoryName" class="vue-twemoji-picker__emoji">
          <div :style="emojiStyle(emojiForCategory(categoryName))" ></div>
        </div>
      </div>
    </div>
    <div>
      <input :ref="'search'" class="vue-twemoji-picker__search" v-model="search" :placeholder="placeholder">
    </div>
    <div :ref="'emojis'" class="vue-twemoji-picker__emojis">
      <!-- Recent emojis -->
      <div id="recent" ref="recent" v-show="filteredRecentEmojis.length > 0">
        <div class="vue-twemoji-picker__category_title">{{ recent }}</div>
        <div @click="selectEmoji(emoji)" v-for="emoji in filteredRecentEmojis" v-bind:key="`recent-${emoji.short_name}`" class="vue-twemoji-picker__emoji">
          <div :style="emojiStyle(emoji)"></div>
        </div>
      </div>

      <!-- Emojis -->
      <div :ref="categoryName" v-for="(emojis, categoryName) in filteredEmojis" v-bind:key="categoryName">
        <div class="vue-twemoji-picker__category_title">{{ categories[categoryName] }}</div>
        <div @click="selectEmoji(emoji)" v-for="emoji in emojis" v-bind:key="`${categoryName}-${emoji.short_name}`" class="vue-twemoji-picker__emoji">
          <div :style="emojiStyle(emoji)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-side-effects-in-computed-properties */

import fullEmojiList from './emojis.json'

export default {
  data () {
    return {
      emojiForCategories: {
        'recent': 'smile',
        'smileys': 'sunglasses',
        'animals': 'bear',
        'food': 'hamburger',
        'activities': 'soccer',
        'travel': 'city_sunrise',
        'objects': 'bulb',
        'symbols': 'black_joker',
        'flags': 'crossed_flags'
      },
      availableCategories: {
        'recent': true,
        'smileys': true,
        'animals': true,
        'food': true,
        'activities': true,
        'travel': true,
        'objects': true,
        'symbols': true,
        'flags': true
      },
      realCategoryNames: {
        'smileys': 'Smileys & People',
        'animals': 'Animals & Nature',
        'food': 'Food & Drink',
        'activities': 'Activities',
        'travel': 'Travel & Places',
        'objects': 'Objects',
        'symbols': 'Symbols',
        'flags': 'Flags'
      },
      categories: {},
      currentCategory: '',
      scrollingTo: false,
      recentEmojis: [],
      emojiList: [],
      search: '',
      emojisByCategories: []
    }
  },
  props: {
    categoryNames: {
      type: Object
    },
    recent: {
      default: 'Recent'
    },
    placeholder: {
      default: 'Search'
    },
    maxRecentEmojiLines: {
      default: 3
    },
    focusInput: {
      default: true
    }
  },
  created () {
    this.categories = Object.assign({}, this.realCategoryNames)
    Object.assign(this.categories, this.categoryNames)

    this.emojiList = fullEmojiList

    let lsRecentEmojis = window.localStorage.getItem('vue-twemoji-picker-recent-emojis')

    if (lsRecentEmojis) {
      this.currentCategory = 'recent'
      this.recentEmojis = JSON.parse(lsRecentEmojis)
    } else {
      this.currentCategory = 'smileys'
    }

    for (var i = 0; i < this.recentEmojis.length; i++) {
      let recentEmoji = this.recentEmojis[i]
      recentEmoji.category = Object.keys(this.emojiForCategories)[0]
      this.emojiList.unshift(recentEmoji)
    }

    this.emojisByCategories = this.emojiList
      .sort((b, a) => b.order - a.order)
      .reduce((result, emoji) => {
        if (Object.values(this.realCategoryNames).indexOf(emoji.category) != -1) {
          let category = Object.keys(this.realCategoryNames).find( k => this.realCategoryNames[k] == emoji.category )
          result[category] = result[category] || []
          result[category].push(emoji)
        }
        return result
      }, {});
  },
  mounted () {
    this.$refs.emojis.addEventListener('scroll', this.handleScroll)
    if (this.focusInput) {
      this.$refs.search.focus()
    }
  },
  computed: {
    filteredEmojis () {
      let filteredCategories = {
        'smileys': [],
        'animals': [],
        'food': [],
        'activities': [],
        'travel': [],
        'objects': [],
        'symbols': [],
        'flags': []
      }

      Object.keys(this.emojisByCategories).forEach((category) => {
        let filteredEmojis = this.emojisByCategories[category].filter(emoji => {
          return emoji.short_names.find((shortName) => shortName.replace('_', '').match(this.search))
        })

        if (filteredEmojis.length > 0) {
          filteredCategories[category] = filteredEmojis
          this.availableCategories[category] = true
        } else {
          this.availableCategories[category] = false
          delete filteredCategories[category]
        }
      })

      return filteredCategories
    },
    filteredRecentEmojis () {
      let filtered = this.recentEmojis.filter(recentEmoji => recentEmoji.short_names.find((shortName) => shortName.replace('_', '').match(this.search)))

      this.availableCategories['recent'] = filtered.length > 0

      return filtered
    }
  },
  watch: {
    recentEmojis() {
      window.localStorage.setItem('vue-twemoji-picker-recent-emojis', JSON.stringify(this.recentEmojis))
    }
  },
  methods: {
    categoryClick(category) {
      let emojisDiv = this.$refs.emojis

      emojisDiv.scrollBy({
        top:  this.categoryOffset(category) - emojisDiv.scrollTop,
        left: 0,
        behavior: 'smooth'
      });
    },
    emojiForCategory (category) {
      return this.emojiList.find(emoji => emoji.short_name == this.emojiForCategories[category])
    },
    emojiStyle (emoji) {
      if (emoji) {
        return {
          'background-position': `calc(${emoji.x} * 100% / 56) calc(${emoji.y} * 100% / 56)`
        }
      }
    },
    selectEmoji (emoji) {
      this.$emit('pick', emoji)

      let emojiIndex = this.recentEmojis.findIndex(recentEmoji => recentEmoji.short_name == emoji.short_name)

      if (emojiIndex >= 0) {
        this.recentEmojis.splice(emojiIndex, 1)
      }

      if (this.recentEmojis.length >= this.maxRecentEmojiLines * 9) {
        this.recentEmojis.pop()
      }

      this.search = ''

      this.recentEmojis.unshift(emoji)

    },
    handleScroll () {
      let scrolledToCategory = 'recent'

      for (var i = 0; i < Object.keys(this.emojiForCategories).length; i++) {
        let category = Object.keys(this.emojiForCategories)[i]

        if (this.$refs[category]) {
          if (this.$refs.emojis.scrollTop >= this.categoryOffset(category)) {
            scrolledToCategory = category
          }
        }
      }

      this.currentCategory = scrolledToCategory
    },
    categoryOffset (category) {
      let recentOffset = this.$refs['recent'].offsetTop
      return category == 'recent' ? 0 : this.$refs[category][0].offsetTop - (recentOffset == 0 ? 90 : recentOffset)
    }
  },
  destroyed () {
    if (this.$refs.emojis) {
      this.$refs.emojis.removeEventListener('scroll', this.handleScroll)
    }
  }
}
</script>

<style>
.vue-twemoji-picker {
  max-width: 306px;
  max-height: 388px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border: 1px #e6ecf5 solid;
  border-radius: 6px;
  box-sizing: content-box;
  background-color: #fff;
}

.vue-twemoji-picker * {
  box-sizing: content-box;
}

.vue-twemoji-picker__categories {
  display: -webkit-inline-box;
  margin: 0 -6px 0px -6px;
  padding: 0 6px 6px 6px;
  border-bottom: 1px #e6ecf5 solid;
}

.vue-twemoji-picker__category {
  flex-grow: 1;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
}

.vue-twemoji-picker__emojis {
  overflow: auto;
  padding-top: 6px;
}

.vue-twemoji-picker__category_title {
  padding: 12px 6px;
  font-weight: bold;
  color: #7f8fa4;
  font-size: 15px;
}

.vue-twemoji-picker__emoji {
  width: 22px;
  height: 22px;
  display: inline-block;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  box-sizing: content-box;
}

.vue-twemoji-picker__emoji div {
  width: 22px;
  height: 22px;
  display: inline-block;
  background-size: 5700% 5700%;
  background-image: url('~@/assets/emojis.png')
}

.vue-twemoji-picker__emoji:hover, .vue-twemoji-picker__category__current {
  background-color: #edf2f5;
}

.vue-twemoji-picker__category__unavailable {
  opacity: .2;
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
  pointer-events: none;
}

.vue-twemoji-picker__search {
  padding: 6px 12px;
  border: 1px #e6ecf5 solid;
  border-radius: 6px;
  margin-top: 6px;
  width: calc(100% - 24px);
  outline: none;
  color: #7f8fa4;
  line-height: 14px;
  font-size: 11px;
  box-sizing: content-box;
}
</style>
