<template>
  <div class="home-view">
    <RouterLink class="module-card" target="_blank" :to="{ name: 'AsyncForm' }">
      <figure>
        <img src="@/assets/svgs/form.svg" alt="" />
        <figcaption>动态表单</figcaption>
      </figure>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  width: 800px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 20px;
  row-gap: 30px;
  margin: 30px auto;

  .module-card {
    text-decoration: none;
    display: block;
    box-shadow: var(--el-box-shadow-light);
    padding: 20px;
    border: 1px solid var(--el-card-border-color);
    border-radius: 4px;

    &:link,
    &:active,
    &:visited {
      color: rgb(51, 126, 204);
    }

    figure {
      width: 100%;
    }

    img {
      width: 100%;
    }
  }
}
</style>
