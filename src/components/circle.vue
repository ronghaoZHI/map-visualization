<template>
  <div class="container">
    <svg
			class="svg"
      width="16px"
      height="17px"
      viewBox="0 0 16 17"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Generator: Sketch 59 (86127) - https://sketch.com -->
      <defs>
        <linearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="99.823163%"
          :id="'linearGradient-' + _uid"
        >
          <stop offset="30%" :stop-color="stopColor" />
          <stop offset="100%" :stop-color="startColor" />
        </linearGradient>
      </defs>
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g
          transform="translate(-1710.000000, -487.000000)"
          :stroke="'url(#linearGradient-' + _uid + ')'"
          stroke-width="3"
        >
          <g transform="translate(1508.000000, 460.000000)">
            <g transform="translate(202.000000, 27.000000)">
              <circle cx="8" cy="8" r="6"></circle>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>

export default {
  name: "CircleIcon",
  props: {
    startColor: {
      type: String,
      required: false,
      default: "#bbff42"
    },
    stopColor: {
      type: String,
      required: false,
      default: "#429321"
    }
  }
};
</script>
<style lang="less" scoped>
.container {
	position: relative;
}
.svg {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	border-radius: 50%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>