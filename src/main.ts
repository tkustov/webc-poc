// import './i12e/view/webc/activity.js';
import './i12e/view/webc/theme/index.css';
import './i12e/view/webc/uikit/tabs.js';
import './i12e/view/webc/uikit/dropdown.js';
import './i12e/view/webc/uikit/scrollpane.js';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <cx-tabs id="tabs" active="first" nav-position="top">
    <div class="tab-title" data-cx-tab="first">First</div>
    <div class="tab-title" data-cx-tab="second">Second</div>
    <div class="tab-title" data-cx-tab="third">Third</div>
    <div class="tab-content" data-cx-tab-panel="first">
      First Tab <button type="button" tabindex="0">Focusable</button>
      <ul>
        <li>First item</li>
        <li>Second item</li>
      </ul>
    </div>
    <div class="tab-content" data-cx-tab-panel="second">Second content</div>
  </cx-tabs>

  <cx-dropdown open="false" placement="bottom" close-trigger="outside-click">
    <button type="button" slot="trigger" data-cx-dropdown-trigger="true">
      Select
    </button>
    <div slot="content">
      <button type="button">btn1</button><br/>
      <input type="text" />
    </div>
  </cx-dropdown>

  <cx-scrollpane id="scroll-test">
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <cx-scrollpane id="scroll-test-inner">
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
      <p>Scroll content</p>
    </cx-scollpane>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
    <p>Scroll content</p>
  </cx-scrollpane>
`;

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.body.querySelector('#tabs')! as HTMLElementTagNameMap['cx-tabs'];

  const title = document.createElement('div');
  const content = document.createElement('div');
  title.appendChild(document.createTextNode('Fourth'));
  content.innerHTML = `
    <h1>Fourth tab</h1>
    <p>Fourth content</p>
  `;

  tabs.insertTab(
    'fourth',
    title,
    content
  );
});
