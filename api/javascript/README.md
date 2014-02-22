##JAVASCRIPT API

###Методы
* loading(file path,callback function) - Загрузка файла
* create() - Создание анимации
* setPosition({x,y}) - Установить позицию
* getLayer(name,callback function) - Найти слой по имени
* getPoints(name,callback function) - Найти кость по имени
* setAnimate(name,{option}) - Установить анимацию
* scin(name,bool) - Показать спрятать скин
* update() - Обновить кадр анимации
* destroy() - Уничтодить анимацию

###Быстрый старт
```html
<script type="text/javascript" src="/amrorm.js"></script>

<script>
var anim = new amrorm({
    pathToImages: '../dirname/images/' //путь к изображениям
})

/*Событие на новою кость или слой*/
anim.onCreate = function(a){
    ...
}

/*Событие на обновление кадра*/
anim.onUpdate = function(a){
    ...
}

/*Событие на уничтожение кости или слоя*/
anim.onDestroy = function(a){
    ...
}
</script>
```

###loading()
Осушествляет загрузку файла для анимации

```javascript

anim.loading('../data/exemple.am',function(images){
    
    //images содержит массив путей к изображениям 
    //['../dirname/images/01.png','../dirname/images/02.png']
    
    ...
})
```

###create()
Создает анимацию

```javascript
anim.create();
```

###setPosition()
Устанавливает позицию для анимации

```javascript
anim.setPosition({
    x: 100,
    y: 100
});
```

###getLayer()
Поиск слоев по имени

```javascript
/*поиск только одного совпадения*/

var result = anim.getLayer('name');

/*поиск всех по совпадению*/

anim.getLayer('name',function(resilt){
    
});
```

###getPoints()
Поиск костей по имени

```javascript
/*поиск только одного совпадения*/

var result = anim.getPoints('name');

/*поиск всех по совпадению*/

anim.getPoints('name',function(resilt){
    
});
```

###setAnimate()
Устанавливает анимацию, если анимации по имени не найдено то будет установлена анимация по дефолту

```javascript
/*Простой способ*/
anim.setAnimate('name');

/*С настройками*/
anim.setAnimate('name',{
    
});
```