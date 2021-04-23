<template>
  <div class="app">
    <!-- 三维地图 -->
    <div id="maptalks"></div>
    <!-- 左上角 title -->
    <header class="header">
      <div class="wrap">
        <span class="logo"> </span>
        <span class="title"> 数据监控平台 </span>
      </div>
    </header>
    <!-- 右侧栏 -->
    <div class="date-wrap">
      <div class="date">
        <span class="time" v-html="updateTime"></span>
      </div>
    </div>
    <div class="side-wrap">
      <div class="wrap">
        <!-- 竖向轮播 中间active -->
        <section class="top">
          <swiper class="swiper-type" ref="swiper-type" :options="swiperTypeOpt">
            <swiper-slide class="data-type">
              <div>
                <span class="title">AirlookMap地图面积</span>
                <span :style="{ 'opacity': showNumber ? 1 : 0 }" class="number"
                  ><span class="num">{{ areaTotalList[0] || 0 }}</span> km²</span
                >
              </div>
            </swiper-slide>
            <swiper-slide class="data-type">
              <div>
                <span class="title">数据采集面积</span>
                <span :style="{ 'opacity': showNumber ? 1 : 0 }" class="number"
                  ><span class="num">{{ areaTotalList[1] || 0 }}</span> km²</span
                >
              </div>
            </swiper-slide>
            <swiper-slide class="data-type">
              <div>
                <span class="title">三维数据生产面积</span>
                <span :style="{ 'opacity': showNumber ? 1 : 0 }" class="number"
                  ><span class="num">{{ areaTotalList[2] || 0 }}</span> km²</span
                >
              </div>
            </swiper-slide>
           
          </swiper>
        </section>
        <section class="middle">
          <div class="title">{{ themeTitle }}城市覆盖率</div>
          <div class="content">
            <ProgressBar
              :startColor="progressStartColor"
              :stopColor="progressStopColor"
              :diameter="130"
              class="progress"
              innerStrokeColor="#838486"
              :innerStrokeWidth="9"
              :strokeWidth="9"
              :isClockwise="false"
              :totalSteps="100"
              :completedSteps="completedProgress"
              :animateSpeed="1500"
            >
              <div class="percent">
                {{ completedProgress }}<span class="symbol">%</span>
              </div>
              <div class="num">{{ cityCount + "/" + cityTotal }}</div>
            </ProgressBar>
            <div class="label-wrap">
              <div class="city1">
                <CircleIcon 
                  class="img"
                  :startColor="progressStartColor"
                  :stopColor="progressStopColor"
                ></CircleIcon>
                <span class="name">已采集城市</span>
              </div>
              <div class="city2">
                <CircleIcon
                  class="img"
                  startColor="#949494"
                  stopColor="#676767"
                ></CircleIcon> 
                <span class="name">待采集城市</span>
              </div>
            </div>
          </div>
        </section>
        <section class="bottom">
          <div class="title">{{ themeTitle }}覆盖城市</div>
          <div class="content" v-if="resetCityList">
            <CityList :style="cityStyle" :dataList="curCityList" @emitSwp="getSwp"> </CityList>
          </div>
        </section>
      </div>
    </div>
    <div :style="{ 'opacity': showSouthImage ? 1 : 0 }" class="side-image">
    </div>
  </div>
</template>

<script>
import { initChinaMap } from "./layer";
import ProgressBar from "../../components/progress";
import CircleIcon from '../../components/circle';
import { progressColor, themeTitle } from "./utils";
import CityList from "./CityList";

export default {
  components: {
    ProgressBar,
    CityList,
    CircleIcon
  },
  data() {
    return {
      showNumber: false,
      showSouthImage: true,
      updateTime: undefined,
      swiperCityList: undefined,
      resetCityList: false,
      themeTitle: themeTitle[0],
      progressStartColor: progressColor[0].startColor,
      progressStopColor: progressColor[0].stopColor,
      cityCount: 0,
      cityTotal: 0,
      areaTotalList: [],
      completedProgress: 0,
      curCityList: [],
      swiperTypeOpt: {
        direction: "vertical",
        loop: true,
        slidesPerView: 3,
        centeredSlides: true,
        centeredSlidesBounds: true,
        height: 162
      },
      cityStyle: {
        'animation': 'fade_out 2s linear',
      },
      fadeIn: {
        'animation': 'fade_in 1s linear',
      },
      fadeOut: {
        'animation': 'fade_out 1s linear',
      }
    };
  },
  watch: {
    swiperCityList() {
      // console.log("Swiper instance object", this.swiperType, this.swiperCityList);
    }
  },
  computed: {
    swiperType() {
      return this.$refs["swiper-type"].$swiper;
    }
  },
  mounted() {
    this.initMap("maptalks");
  },
  methods: {
    initMap(dom) {
      initChinaMap(dom, this);
    },
    getSwp(swp) {
      this.swiperCityList = swp;
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

.header {
  position: absolute;
  left: 3.3vw;
  top: 3.6vh;
  width: 0;
  animation: _width 1s .5s forwards linear;
  overflow: hidden;
  @keyframes _width {
    0% {
      width: 0;
    }
    100% {
      width: 454px;
    }
  }
  .wrap {
    position: relative;;
    display: flex;
    align-items: center;
    width: 454px;
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
}

.date-wrap {
  position: absolute;
  right: 1vw;
  top: 3.2vh;
  font-size: 24px;
  color: #BAC0C7;
  height: 0;
  animation: _downdate 1s 2s forwards linear;
  overflow: hidden;
  @keyframes _downdate {
    0% {
      height: 0;
    }
    100% {
      height: 33px;
    }
  }

  .date {
    height: 33px;
    line-height: 33px;
  }
}

.side-wrap {
  box-sizing: border-box;
  font-family: PingFangSC-Medium;
  width: 25.5vw;
  max-width: 490px;
  min-width: 400px;
  position: absolute;
  right: 1vw;
  top: 9vh;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  opacity: 0;
  height: 960px;
  padding: 46px 46px;
  animation: fade_out 1s 1s forwards linear;

  .wrap {
    position: relative;
    height: 0;
    overflow: hidden;
    animation: _down 3.5s 2s forwards linear;
  }

  @keyframes _down {
    0% {
      height: 0;
    }
    100% {
      height: 868px;
    }
  }

  .top {
    height: 201px;
    overflow: hidden;
    padding-left: 10px;
    .swiper-type {
      opacity: 0;
      animation: fade_out 1.5s 2s forwards linear;
    }
    .data-type {
      color: #969696;
      // height: 80px !important;
      span {
        display: block;
        text-align: left;
        letter-spacing: 1.4px;
      }
      span.num {
        display: inline-block;
        font-weight: 600;
      }
      .title {
        word-break: keep-all;
        font-size: 14px;
      }
      .number {
        transition: opacity .5s ease-in;
        font-size: 18px;
        margin-top: 4px;
      }
    }
    /deep/ .swiper-slide-active .number {
      font-size: 28px;
      color: var(--themeColor);
    }
    /deep/ .swiper-slide-active {
      margin-top: 20px;
      margin-bottom: 27px;
    }
    /deep/ .swiper-slide-active .title {
      font-size: 20px;
      color: #ffffff;
    }
  }

  .middle .title,
  .bottom .title {
    text-align: left;
    background: #262424;
    padding: 9px 24px;
    font-size: 20px;
    color: #9f9f9f;
    letter-spacing: 1.3px;
  }
  .middle {
    margin-top: 36px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    height: 194px;
    .content {
      opacity: 0;
      animation: fade_out 1s 4s forwards linear;
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      align-items: center;
      .progress {
        position: relative;
        .percent {
          font-size: 30px;
          font-weight: 600;
          color: var(--themeColor);
          .symbol {
            font-size: 18px;
          }
        }
        .num {
          color: #fff;
          font-size: 18px;
        }
      }
      .label-wrap {
        display: flex;
        flex-direction: column;

        div {
          font-size: 14px;
          color: #ffffff;
          letter-spacing: 1.3px;
        }
        .city1 {
          align-items: center;
          display: flex;
          flex-direction: row;
        }
        .city2 {
          align-items: center;
          margin-top: 25px;
          display: flex;
          flex-direction: row;
        }
        .city1 , 
        .city2 {
          .img {
            width: 15px;
            height: 15px;
          }
          .name {
            margin-left: 8px;
          }
        }
      }
    }
  }

  .bottom {
    height: 354px;
    display: flex;
    flex-direction: column;
    .content {
      padding-top: 10px;
    }
  }
}

.side-image {
  position: absolute;
  left: 55vw;
  top: 71vh;
  height: 230px;
  width: 152px;
  background-image: url(../../assets/imgs/chinaS.png);
  background-size: 100%;
  background-repeat: no-repeat;
  transition: opacity .2s ease-out;
}
</style>

<style lang="less">
.history_marker {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  position: relative;
  will-change: auto;
  top: 20px;
  .circle {
    width: 8px;
    height: 8px;
    background: var(--themeColor);
    border-radius: 50%;
    position: relative;
    top: 0px;
  }
  .circle1 {
    width: 20px;
    height: 20px;
    background: transparent;
    border: 1px solid var(--themeColor);
    border-radius: 50%;
    animation: _scale1 1.4s linear 0.7s infinite;
    position: relative;
    top: -15px;
  }

  .circle2 {
    width: 20px;
    height: 20px;
    border: 1px solid var(--themeColor);
    border-radius: 50%;
    background: transparent;
    position: relative;
    top: -36px;
    animation: _scale2 1.4s linear infinite;
  }
  @keyframes _scale1 {
    0% {
      transform: scale3d(0, 0, 1);
      border-color: var(--themeColor);
      opacity: 1;
    }
    90% {
      transform: scale3d(1.6, 1.6, 1) ;
      border-color: var(--themeColor);
      opacity: 0.2;
    }
    100% {
      transform: scale3d(1.6, 1.6, 1) ;
      border-color: var(--themeColor);
      opacity: 0;
    }
  }
  @keyframes _scale2 {
    0% {
      transform: scale3d(0, 0, 1);
      border-color: var(--themeColor);
      opacity: 1;
    }
    90% {
      transform: scale3d(1.6, 1.6, 1);
      border-color: var(--themeColor);
      opacity: 0.2;
      top: -37px;
    }
    100% {
      transform: scale3d(1.6, 1.6, 1);
      border-color: var(--themeColor);
      opacity: 0;
      top: -37px;
    }
  }
}
.city_marker {
  will-change: auto;
  color: aqua;
  display: flex;
  transition: all 0.5s ease;
  will-change: auto;
  transition: transform 1s 0.5s;
  transform: translate3d(20px, 0, 0) scale3d(1, 1, 1);

  &.big {
    font-size: 34px;
    transform: translate3d(20px, 0, 0) scale3d(1.5, 1.5, 1);
  }
  // &.paused {
  //   .left {
  //     .circle1, .circle2 {
  //       animation-play-state: paused;
  //     }
  //   }
  // }

  .left {
    width: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    position: relative;

    .icon {
      width: 18px;
      height: 24px;
      margin-left: 1px;
      background-size: 100%;
      background-position: center;
      background-repeat: no-repeat;
    }

    .circle1 {
      width: 20px;
      height: 10px;
      background: transparent;
      border: 2px solid var(--themeColor);
      border-radius: 50%;
      animation: scale 1.4s linear 0.7s infinite;
      position: relative;
      top: -8px;
    }

    .circle2 {
      width: 20px;
      height: 10px;
      border: 2px solid var(--themeColor);
      border-radius: 50%;
      background: transparent;
      position: relative;
      top: -22px;
      animation: scale 1.4s linear infinite;
    }
  }

  &.data_map3d {
    .left .icon {
      background-image: url(../../assets/imgs/poi.png);
    }
  }
  &.data_capture {
    .left .icon {
      background-image: url(../../assets/imgs/poi-1.png);
    }
  }
  &.data_3d {
    .left .icon {
      background-image: url(../../assets/imgs/poi-2.png);
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
  
  @keyframes scale {
    0% {
      transform: scale3d(0, 0, 0);
      border-color: var(--themeColor);
      opacity: 1;
    }
    90% {
      transform: scale3d(1.6, 1.6, 1.6) translateY(4px);
      border-color: var(--themeColor);
      opacity: 0.2;
    }
    100% {
      transform: scale3d(1.7, 1.7, 1.7) translateY(4px);
      border-color: var(--themeColor);
      opacity: 0;
    }
  }
}
.maptalks-attribution {
  display: none;
}
.cityfade-enter-active {
  animation: fade_out 2s ease;
}
.cityfade-leave-active {
  animation: fade_in 2s ease;
}

@keyframes fade_out {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fade_in {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>