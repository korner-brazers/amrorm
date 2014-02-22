##JAVASCRIPT API

###Методы
* `loading(file path,callback function)` - Загрузка файла анимации
* `create()` - Создание анимации
* `setPosition({x,y})` - Установить позицию
* `getLayer(name,callback function)` - Найти слой по имени
* `getPoints(name,callback function)` - Найти кость по имени
* `setAnimate(name,{option})` - Установить анимацию
* `skin(name,bool)` - Показать спрятать скин
* `update()` - Обновить кадр анимации
* `destroy()` - Уничтожить анимацию

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

/*Содержание переменной (a)*/
/*
a.position.x;
a.position.y;

a.opacity;
a.visible;

a.scale.x;
a.scale.y;

a.anchor.x;
a.anchor.y;

a.rotate;
*/
</script>
```

###loading()
Осуществляет загрузку файла для анимации

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
Поиск слов по имени

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
    useAmount: 10 //установить текущее время анимации на 10%
});
```

###skin()
Показать или спрятать скин

```javascript
anim.skin('name',true);
```

###update()
Обновить кадр анимации

```javascript
anim.update();
```

###destroy()
Удалить всю анимацию

```javascript
anim.destroy();
```