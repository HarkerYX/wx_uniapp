import wepy from 'wepy'

export default class extends wepy.mixin {
    data = {
        // 搜索框中的默认内容
        value: '',
        // 搜索建议列表
        suggestList: [],
        // 搜索历史列表
        kwList: []
    }

    onLoad() {
        // 调用小程序官方提供的 getStorageSync 函数，可以从本地存储中读取数据
        const kwList = wx.getStorageSync('kw') || []
        console.log('kwList' + kwList)
            // 将读取的数据挂载到 data 中
        this.kwList = kwList
    }

    methods = {
        // 当搜索关键词发生变化，会触发这个事件处理函数
        onChange(e) {
            console.log(e.detail)
            this.value = e.detail.trim()
            if (e.detail.trim().length <= 0) {
                this.suggestList = []
                return
            }
            this.getSuggestList(e.detail)
        },

        // 触发了搜索
        onSearch(e) {
            // e.detail 就是最新的搜索关键字
            const kw = e.detail.trim()
            console.log(kw)
            if (kw.length <= 0) {
                return
            }

            // 把用户填写的搜索关键词，保存到 Storage 中
            if (this.kwList.indexOf(kw) === -1) {
                this.kwList.unshift(kw)
            }

            // 数组的 slice 方法，不会修改原数组，而是返回一个新的数组
            this.kwList = this.kwList.slice(0, 10)
            wepy.setStorageSync('kw', this.kwList)

            wepy.navigateTo({
                url: '/pages/goods_list?query=' + kw
            })
        },

        // 清除搜索历史记录
        clearHistory() {
            this.kwList = []
            wepy.setStorageSync('kw', [])
        },

        // 点击搜索建议项，导航到商品详情页面
        goGoodsDetail(goods_id) {
            wepy.navigateTo({
                url: '/pages/goods_detail/main?goods_id=' + goods_id
            })
        }
    }


    // 计算属性
    computed = {
        // true 展示搜索历史区域
        // false 展示搜索建议区域
        isShowHistory() {
            if (this.value.length <= 0) {
                return true
            }
            return false
        }
    }

    // 获取搜索建议列表
    async getSuggestList(searchStr) {
        const { data: res } = await wepy.get('/goods/qsearch', { query: searchStr })

        if (res.meta.status !== 200) {
            return wepy.baseToast()
        }

        this.suggestList = res.message
        this.$apply()
    }
}