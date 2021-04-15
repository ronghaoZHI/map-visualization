<template>
  <div class="app">
    <!-- 三维地图 -->
    <div id="maptalks"></div>
    <!-- 左上角 title -->
    <header class="header">
      <span class="logo"> </span>
      <span class="title"> 数据监控平台 </span>
    </header>
    <!-- 右侧栏 -->
    <div class="side-wrap">
      <!-- 竖向轮播 中间active -->
      <section class="top">
        <swiper ref="swiper" :options="swiperOptions">
          <div></div>
          <div></div>
          <div></div>
        </swiper>
      </section>
      <section class="middle">
        <div class="title"></div>
        <div class="content">
          <div class="progres"></div>
          <div class="label"></div>
        </div>
      </section>
      <section class="bottom">
        <div class="title"></div>
        <div class="content">
          <div class="list" v-for="item in curCityList" :key="item.name">
            <span class="name">{{ item.name }}</span>
            <span class="area">{{ item.area }} km²</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { initChinaMap } from "./layer";

export default {
  data() {
    return {
      curCityList: [
        {
          name: "xx",
          area: "xx"
        }
      ],
      swiperOptions: {
        direction: "vertical",
        loop: true,
        slidesPerView: 3,
        centeredSlides: true,
        centeredSlidesBounds: true
      }
    };
  },
  computed: {
    swiper() {
      return this.$refs.swiper.$swiper;
    }
  },
  mounted() {
    console.log("Current Swiper instance object", this.swiper);
    this.swiper.slideTo(3, 1000, false);

    this.initMap("maptalks");
  },
  methods: {
    initMap(dom) {
      initChinaMap(dom, this);
    }
  }
};
</script>

<style lang="less" scoped>
.app,
#maptalks {
  background-color: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
* {
  color: var(--themeColor);
}
.header {
  position: absolute;
  left: 3.3vw;
  top: 3.6vh;
  display: flex;
  align-items: center;
  
  .logo {
    margin-top: 6px;
    width: 220px;
    height: 30px;
    background-image: url(../../assets/imgs/logo.svg);
    background-repeat: no-repeat;
    background-size: 100%;
  }
  .title {
    margin-left: 7px;
    font-size: 36px;
    color: #bac0c7;
    letter-spacing: 1.5px;
  }
}

.side-wrap {
  width: 25.5vw;
  /* height: 85vh; */
  position: absolute;
  right: 1vw;
  top: 9vh;
  background: rgba(0, 0, 0, 1);
  border: 1px solid #fff;
  padding: 46px 46px;

  .top {
    display: flex;
    padding-left: 10px;
  }

  .middle {
    .title {
    }

    .content {
    }
  }

  .bottom {
    .title {
    }

    .content {
    }
  }
}
</style>

<style lang="less">
.city_marker {
  will-change: auto;
  color: aqua;
  display: flex;
  transition: all 0.5s ease;
  transform: translate3d(20px, 0px, 0) scale3d(1, 1, 1);

  &.big {
    font-size: 34px;
    transform: translate3d(40px, 0px, 0) scale3d(1.5, 1.5, 1.5);
  }

  .left {
    width: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;

    .icon {
      width: 18px;
      height: 24px;
      background: url(../../assets/imgs/poi.png) no-repeat;
      background-size: 100%;
      /* animation: poi .8s linear infinite; */
    }

    .circle1 {
      width: 20px;
      height: 10px;
      background: transparent;
      border: 2px solid rgb(244, 187, 40);
      border-radius: 50%;
      animation: scale 1.4s linear 0.7s infinite;
      position: relative;
      top: -8px;
    }

    .circle2 {
      width: 20px;
      height: 10px;
      border: 2px solid rgb(244, 187, 40);
      border-radius: 50%;
      background: transparent;
      position: relative;
      top: -22px;
      animation: scale 1.4s linear infinite;
    }
  }

  .right {
    position: relative;
    top: -8px;
    display: flex;
    align-items: center;
    font-size: 16px;
    position: relative;
    vertical-align: middle;
    width: 40px;
    overflow: visible;
    word-break: keep-all;
    letter-spacing: 1px;
    text-align: left;
  }
}

@keyframes scale {
  0% {
    transform: scale3d(0, 0, 0);
    border-color: rgb(244, 187, 40);
    opacity: 1;
  }
  90% {
    transform: scale3d(1.6, 1.6, 1.6) translateY(4px);
    border-color: rgb(244, 187, 40);
    opacity: 0.2;
  }
  100% {
    transform: scale3d(1.7, 1.7, 1.7) translateY(4px);
    border-color: rgb(244, 187, 40);
    opacity: 0;
  }
}
.maptalks-attribution {
  display: none;
}
</style>