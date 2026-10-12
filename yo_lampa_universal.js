/* YO Lampa Universal 0.1.0 - VIDAA-friendly ES5 plugin.
   Official provider discovery + user-authorized direct media playback.
   No DRM bypass, piracy scrapers or credential harvesting. */
(function () {
 'use strict';
 if (window.YOLampaUniversalLoaded) return;
 window.YOLampaUniversalLoaded = true;
 var VERSION='0.1.0', KEY='yo_lampa_universal_settings';
 var providers=[
  {name:'MEGOGO',url:'https://megogo.net/ua'},
  {name:'SWEET.TV',url:'https://sweet.tv/'},
  {name:'Київстар ТБ',url:'https://tv.kyivstar.ua/'},
  {name:'Takflix',url:'https://takflix.com/'},
  {name:'Суспільне',url:'https://suspilne.media/'},
  {name:'YouTube Movies',url:'https://www.youtube.com/results?search_query=movies'},
  {name:'Netflix',url:'https://www.netflix.com/ua/'},
  {name:'Apple TV',url:'https://tv.apple.com/ua'},
  {name:'Prime Video',url:'https://www.primevideo.com/'},
  {name:'Google TV',url:'https://tv.google/'}
 ];
 var state={language:'uk',quality:'auto',stream:''};
 try {var saved=JSON.parse(localStorage.getItem(KEY)||'{}');for(var k in state)if(saved.hasOwnProperty(k))state[k]=saved[k];}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
 function notice(s){try{if(window.Lampa&&Lampa.Noty)Lampa.Noty.show(s);else console.log('[YO Lampa] '+s);}catch(e){console.log(s);}}
 function menu(items,title){
  if(!window.Lampa||!Lampa.Select||!Lampa.Select.show){notice('Меню недоступно в этой версии Lampa');return;}
  Lampa.Select.show({title:title||'YO Lampa Universal',items:items,onSelect:function(item){if(item&&item.action)item.action();},onBack:function(){}});
 }
 function item(t,subtitle,fn){return {title:t,subtitle:subtitle||'',action:fn};}
 function open(url){
  try{if(window.Lampa&&Lampa.Platform&&Lampa.Platform.open)Lampa.Platform.open(url);else window.open(url,'_blank');}
  catch(e){notice('Откройте адрес в браузере: '+url);}
 }
 function filmName(movie){return (movie&&(movie.title||movie.name||movie.original_title||movie.original_name))||'';}
 function directPlay(url,title){
  if(!/^https:\/\//i.test(url)||!(/\.(mp4|m3u8|mpd)(\?|#|$)/i.test(url))){notice('Требуется прямой HTTPS MP4/HLS/DASH URL');return;}
  if(!window.Lampa||!Lampa.Player||!Lampa.Player.play){notice('Видеоплеер Lampa недоступен');return;}
  try{Lampa.Player.play({url:url,title:title||'YO Lampa Universal',quality:state.quality});}
  catch(e){notice('Ошибка запуска видео: '+e.message);}
 }
 function promptStream(movie){
  var val=window.prompt('Введите свой разрешённый прямой HTTPS-адрес видео (.mp4, .m3u8, .mpd)',state.stream||'');
  if(val===null)return;
  state.stream=val.trim();save();directPlay(state.stream,filmName(movie));
 }
 function settings(movie){menu([
  item('Українська → Русский','Приоритет украинского',function(){state.language='uk';save();notice('Сохранено: українська');}),
  item('Русский → Українська','Приоритет русского',function(){state.language='ru';save();notice('Сохранено: русский');}),
  item('Все языки','Доступные дорожки определяет источник',function(){state.language='all';save();notice('Сохранено: все языки');}),
  item('Качество: Auto',null,function(){state.quality='auto';save();notice('Авто');}),
  item('Качество: 1080p',null,function(){state.quality='1080p';save();notice('1080p');}),
  item('Качество: 720p',null,function(){state.quality='720p';save();notice('720p');}),
  item('Мой прямой видеопоток','MP4 / HLS / DASH, если разрешено источником',function(){promptStream(movie);})
 ],'YO Lampa · Настройки');}
 function show(movie){
  var title=filmName(movie),items=[];
  if(title)items.push(item('Фильм: '+title,'Поиск по каталогам сервисов',function(){show(movie);}));
  for(var i=0;i<providers.length;i++)(function(p){items.push(item(p.name,'Открыть официальный сервис',function(){open(p.url);}));})(providers[i]);
  items.push(item('▶ Мой прямой видеопоток','HTTPS MP4 / HLS / DASH',function(){promptStream(movie);}));
  items.push(item('⚙ Настройки','Язык, качество и собственный поток',function(){settings(movie);}));
  menu(items,'YO Lampa Universal '+VERSION);
 }
 function addButton(e){
  if(!e||e.type!=='complite')return;
  try{
   var root=e.object&&e.object.activity&&e.object.activity.render?e.object.activity.render():null;
   var $=window.jQuery||window.$;
   if(!$||!root)return;
   var buttons=$('.full-start__buttons',root);if(!buttons.length)buttons=$('.full-start__buttons');
   if(!buttons.length||buttons.find('.yo-universal-btn').length)return;
   var btn=$('<div class="full-start__button selector yo-universal-btn"><span>YO Online</span></div>');
   btn.on('hover:enter click',function(){show(e.data&&e.data.movie||e.data||{});});
   buttons.append(btn);
  }catch(err){console.warn('[YO Lampa] Button:',err);}
 }
 function boot(){
  if(!window.Lampa){setTimeout(boot,1000);return;}
  try{
   if(Lampa.Listener&&Lampa.Listener.follow)Lampa.Listener.follow('full',addButton);
   if(Lampa.SettingsApi&&Lampa.SettingsApi.addParam){
    Lampa.SettingsApi.addParam({component:'interface',param:{name:'yo_lampa_universal',type:'button'},field:{name:'YO Lampa Universal',description:'Каталоги и собственные видеопотоки'},onChange:function(){show({});}});
   }
   window.YOLampaUniversal={version:VERSION,open:show,play:directPlay,providers:providers};
   console.log('[YO Lampa] Loaded '+VERSION);
  }catch(err){console.warn('[YO Lampa] Init:',err);}
 }
 boot();
})();
