<template>

  <div class="swp">
    <swiper class="list" ref="swiper-city" :options="swiperCityOpt">
      <swiper-slide class="list-item" v-for="(item) in dataList" :key="item.name">
        <span class="name">{{ item.name }} </span>
        <span class="area">{{ item.area }}km²</span>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
export default {
  props: {
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      swiperCityOpt: {
        direction: "vertical",
        loop: true,
        slidesPerView: 5,
				loopAdditionalSlides: 1,
				height: 302
      }
    };
  },
  computed: {
    swiperCityList() {
      return this.$refs["swiper-city"].$swiper;
    }
  },
  mounted() {
		console.log('dataList', this.dataList)
    console.log("Current Swiper instance object", this.swiperCityList);
		this.$emit('emitSwp', this.swiperCityList);
  },
	destroyed() {
		// this.swiperCityList.destroy();
	}
};
</script>

<style lang="less" scoped>
.swp {
	height: 300px;
	overflow: hidden;
  font-size: 24px;
  letter-spacing: 1.3px;
	color: #ffffff;
	text-align: left;
	.list {
		.list-item {
			height: 59px !important;
			padding-bottom: 5px;
			line-height: 33px;
			box-sizing: border-box;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			border-bottom: 1px solid #6C6C6C;
			align-items: flex-end;
			.area { 
				text-align: right;
			}
		}

		/deep/ .swiper-slide-active {
			margin-top: 2px;
			color: var(--themeColor);
			.area {
				line-height: 44px;
				font-size: 42px;
			}
		}
	}
}

</style>