(function(){
  var languages={
    en:{label:"English",short:"EN",flag:"us.svg",html:"en"},
    es:{label:"Espa\u00f1ol",short:"ES",flag:"es.svg",html:"es"},
    fr:{label:"Fran\u00e7ais",short:"FR",flag:"fr.svg",html:"fr"},
    ru:{label:"\u0420\u0443\u0441\u0441\u043a\u0438\u0439",short:"RU",flag:"ru.svg",html:"ru"},
    ja:{label:"\u65e5\u672c\u8a9e",short:"JA",flag:"jp.svg",html:"ja"},
    ko:{label:"\ud55c\uad6d\uc5b4",short:"KO",flag:"kr.svg",html:"ko"}
  };
  var order=["en","es","fr","ru","ja","ko"];
  var storageKey="yaqixin-language";
  var flagBase="yaqixin-assets/flags/";
  var pageId=Math.random().toString(36).slice(2);
  var originalTitle=document.title;

  var commonExact={
    "Home":{es:"Inicio",fr:"Accueil",ru:"\u0413\u043b\u0430\u0432\u043d\u0430\u044f",ja:"\u30db\u30fc\u30e0",ko:"\ud648"},
    "Products":{es:"Productos",fr:"Produits",ru:"\u0422\u043e\u0432\u0430\u0440\u044b",ja:"\u88fd\u54c1",ko:"\uc81c\ud488"},
    "Inquiry":{es:"Consulta",fr:"Demande",ru:"\u0417\u0430\u043f\u0440\u043e\u0441",ja:"\u304a\u554f\u3044\u5408\u308f\u305b",ko:"\ubb38\uc758"},
    "Product categories":{es:"Categorias de productos",fr:"Categories de produits",ru:"\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u0442\u043e\u0432\u0430\u0440\u043e\u0432",ja:"\u88fd\u54c1\u30ab\u30c6\u30b4\u30ea",ko:"\uc81c\ud488 \uce74\ud14c\uace0\ub9ac"},
    "See all categories":{es:"Ver todas las categorias",fr:"Voir toutes les categories",ru:"\u0412\u0441\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438",ja:"\u3059\u3079\u3066\u306e\u30ab\u30c6\u30b4\u30ea",ko:"\uc804\uccb4 \uce74\ud14c\uace0\ub9ac"},
    "View all plain cotton":{es:"Ver todo algodon liso",fr:"Voir tout le coton uni",ru:"\u0412\u0441\u0435 \u0445\u043b\u043e\u043f\u043a\u043e\u0432\u044b\u0435 \u0442\u043a\u0430\u043d\u0438",ja:"\u30d7\u30ec\u30fc\u30f3\u30b3\u30c3\u30c8\u30f3\u3092\u3059\u3079\u3066\u898b\u308b",ko:"\ud3c9\uc9c1 \uba74 \uc804\uccb4 \ubcf4\uae30"},
    "View all tulle":{es:"Ver todo tul",fr:"Voir tout le tulle",ru:"\u0412\u0435\u0441\u044c \u0444\u0430\u0442\u0438\u043d",ja:"\u30c1\u30e5\u30fc\u30eb\u3092\u3059\u3079\u3066\u898b\u308b",ko:"\ud2a4\ub9dd \uc804\uccb4 \ubcf4\uae30"},
    "View all organza":{es:"Ver toda organza",fr:"Voir tout l'organza",ru:"\u0412\u0441\u044f \u043e\u0440\u0433\u0430\u043d\u0437\u0430",ja:"\u30aa\u30fc\u30ac\u30f3\u30b6\u3092\u3059\u3079\u3066\u898b\u308b",ko:"\uc624\uac04\uc790 \uc804\uccb4 \ubcf4\uae30"},
    "View all lace":{es:"Ver todo encaje",fr:"Voir toute la dentelle",ru:"\u0412\u0441\u0435 \u043a\u0440\u0443\u0436\u0435\u0432\u0430",ja:"\u30ec\u30fc\u30b9\u3092\u3059\u3079\u3066\u898b\u308b",ko:"\ub808\uc774\uc2a4 \uc804\uccb4 \ubcf4\uae30"},
    "View all satin":{es:"Ver todo satin",fr:"Voir tout le satin",ru:"\u0412\u0435\u0441\u044c \u0441\u0430\u0442\u0438\u043d",ja:"\u30b5\u30c6\u30f3\u3092\u3059\u3079\u3066\u898b\u308b",ko:"\uc0c8\ud2f4 \uc804\uccb4 \ubcf4\uae30"},
    "Plain Cotton Fabric":{es:"Tela de algodon liso",fr:"Tissu coton uni",ru:"\u041f\u0440\u043e\u0441\u0442\u0430\u044f \u0445\u043b\u043e\u043f\u043a\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30d7\u30ec\u30fc\u30f3\u30b3\u30c3\u30c8\u30f3\u751f\u5730",ko:"\ud3c9\uc9c1 \uba74 \uc6d0\ub2e8"},
    "Canvas Fabric":{es:"Lona de algodon",fr:"Toile coton",ru:"\u041a\u0430\u043d\u0432\u0430\u0441\u043d\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30ad\u30e3\u30f3\u30d0\u30b9\u751f\u5730",ko:"\uce94\ubc84\uc2a4 \uc6d0\ub2e8"},
    "Poplin Fabric":{es:"Tela popelina",fr:"Tissu popeline",ru:"\u041f\u043e\u043f\u043b\u0438\u043d\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30dd\u30d7\u30ea\u30f3\u751f\u5730",ko:"\ud31d\ub9b0 \uc6d0\ub2e8"},
    "Twill Fabric":{es:"Tela sarga",fr:"Tissu serge",ru:"\u0422\u0432\u0438\u043b\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30c4\u30a4\u30eb\u751f\u5730",ko:"\ud2b8\uc70c \uc6d0\ub2e8"},
    "Tulle Mesh Fabric":{es:"Tela tul malla",fr:"Tissu tulle maille",ru:"\u0424\u0430\u0442\u0438\u043d \u0441\u0435\u0442\u043a\u0430",ja:"\u30c1\u30e5\u30fc\u30eb\u30e1\u30c3\u30b7\u30e5\u751f\u5730",ko:"\ud2a4\ub9dd \uba54\uc26c \uc6d0\ub2e8"},
    "Plain Tulle Fabric":{es:"Tul liso",fr:"Tulle uni",ru:"\u041e\u0434\u043d\u043e\u0442\u043e\u043d\u043d\u044b\u0439 \u0444\u0430\u0442\u0438\u043d",ja:"\u30d7\u30ec\u30fc\u30f3\u30c1\u30e5\u30fc\u30eb",ko:"\ud3c9\uc9c1 \ud2a4\ub9dd"},
    "Holiday Tulle Fabric":{es:"Tul festivo",fr:"Tulle festif",ru:"\u041f\u0440\u0430\u0437\u0434\u043d\u0438\u0447\u043d\u044b\u0439 \u0444\u0430\u0442\u0438\u043d",ja:"\u30db\u30ea\u30c7\u30fc\u30c1\u30e5\u30fc\u30eb",ko:"\ud640\ub9ac\ub370\uc774 \ud2a4\ub9dd"},
    "Rainbow Tulle Fabric":{es:"Tul arcoiris",fr:"Tulle arc-en-ciel",ru:"\u0420\u0430\u0434\u0443\u0436\u043d\u044b\u0439 \u0444\u0430\u0442\u0438\u043d",ja:"\u30ec\u30a4\u30f3\u30dc\u30fc\u30c1\u30e5\u30fc\u30eb",ko:"\ubb34\uc9c0\uac1c \ud2a4\ub9dd"},
    "Organza Fabric":{es:"Tela organza",fr:"Tissu organza",ru:"\u0422\u043a\u0430\u043d\u044c \u043e\u0440\u0433\u0430\u043d\u0437\u0430",ja:"\u30aa\u30fc\u30ac\u30f3\u30b6\u751f\u5730",ko:"\uc624\uac04\uc790 \uc6d0\ub2e8"},
    "Lace Fabric":{es:"Tela de encaje",fr:"Tissu dentelle",ru:"\u041a\u0440\u0443\u0436\u0435\u0432\u043d\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30ec\u30fc\u30b9\u751f\u5730",ko:"\ub808\uc774\uc2a4 \uc6d0\ub2e8"},
    "Eyelash Lace Fabric":{es:"Encaje eyelash",fr:"Dentelle cils",ru:"\u041a\u0440\u0443\u0436\u0435\u0432\u043e eyelash",ja:"\u30a2\u30a4\u30e9\u30c3\u30b7\u30e5\u30ec\u30fc\u30b9",ko:"\uc544\uc774\ub798\uc2dc \ub808\uc774\uc2a4"},
    "3D Beads Lace Fabric":{es:"Encaje 3D con cuentas",fr:"Dentelle 3D perlee",ru:"3D \u043a\u0440\u0443\u0436\u0435\u0432\u043e \u0441 \u0431\u0443\u0441\u0438\u043d\u0430\u043c\u0438",ja:"3D\u30d3\u30fc\u30ba\u30ec\u30fc\u30b9",ko:"3D \ube44\uc988 \ub808\uc774\uc2a4"},
    "Water Soluble Lace Fabric":{es:"Encaje soluble en agua",fr:"Dentelle soluble a l'eau",ru:"\u0412\u043e\u0434\u043e\u0440\u0430\u0441\u0442\u0432\u043e\u0440\u0438\u043c\u043e\u0435 \u043a\u0440\u0443\u0436\u0435\u0432\u043e",ja:"\u6c34\u6eb6\u6027\u30ec\u30fc\u30b9",ko:"\uc218\uc6a9\uc131 \ub808\uc774\uc2a4"},
    "Lace Trim":{es:"Ribete de encaje",fr:"Galon dentelle",ru:"\u041a\u0440\u0443\u0436\u0435\u0432\u043d\u0430\u044f \u043e\u0442\u0434\u0435\u043b\u043a\u0430",ja:"\u30ec\u30fc\u30b9\u30c8\u30ea\u30e0",ko:"\ub808\uc774\uc2a4 \ud2b8\ub9bc"},
    "Satin Fabric":{es:"Tela satin",fr:"Tissu satin",ru:"\u0421\u0430\u0442\u0438\u043d\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30b5\u30c6\u30f3\u751f\u5730",ko:"\uc0c8\ud2f4 \uc6d0\ub2e8"},
    "Denim Fabric":{es:"Tela denim",fr:"Tissu denim",ru:"\u0414\u0436\u0438\u043d\u0441\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c",ja:"\u30c7\u30cb\u30e0\u751f\u5730",ko:"\ub370\ub2d8 \uc6d0\ub2e8"},
    "Search fabrics":{es:"Buscar telas",fr:"Rechercher des tissus",ru:"\u041f\u043e\u0438\u0441\u043a \u0442\u043a\u0430\u043d\u0435\u0439",ja:"\u751f\u5730\u3092\u691c\u7d22",ko:"\uc6d0\ub2e8 \uac80\uc0c9"},
    "Search products":{es:"Buscar productos",fr:"Rechercher des produits",ru:"\u041f\u043e\u0438\u0441\u043a \u0442\u043e\u0432\u0430\u0440\u043e\u0432",ja:"\u88fd\u54c1\u3092\u691c\u7d22",ko:"\uc81c\ud488 \uac80\uc0c9"},
    "Choose language":{es:"Elegir idioma",fr:"Choisir la langue",ru:"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u044f\u0437\u044b\u043a",ja:"\u8a00\u8a9e\u3092\u9078\u629e",ko:"\uc5b8\uc5b4 \uc120\ud0dd"},
    "Click to enlarge":{es:"Ampliar imagen",fr:"Agrandir l'image",ru:"\u0423\u0432\u0435\u043b\u0438\u0447\u0438\u0442\u044c",ja:"\u62e1\u5927\u3057\u3066\u898b\u308b",ko:"\ud06c\uac8c \ubcf4\uae30"},
    "CLICK TO ENLARGE":{es:"AMPLIAR IMAGEN",fr:"AGRANDIR L'IMAGE",ru:"\u0423\u0412\u0415\u041b\u0418\u0427\u0418\u0422\u042c",ja:"\u62e1\u5927",ko:"\ud06c\uac8c \ubcf4\uae30"},
    "Applications":{es:"Aplicaciones",fr:"Applications",ru:"\u041f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u0438\u0435",ja:"\u7528\u9014",ko:"\uc6a9\ub3c4"},
    "FAQ":{es:"Preguntas frecuentes",fr:"FAQ",ru:"\u0412\u043e\u043f\u0440\u043e\u0441\u044b",ja:"FAQ",ko:"FAQ"},
    "Company Name":{es:"Empresa",fr:"Nom de l'entreprise",ru:"\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f",ja:"\u4f1a\u793e\u540d",ko:"\ud68c\uc0ac\uba85"},
    "Email / WhatsApp":{es:"Email / WhatsApp",fr:"Email / WhatsApp",ru:"Email / WhatsApp",ja:"Email / WhatsApp",ko:"Email / WhatsApp"},
    "Quantity / Market":{es:"Cantidad / mercado",fr:"Quantite / marche",ru:"\u041a\u043e\u043b-\u0432\u043e / \u0440\u044b\u043d\u043e\u043a",ja:"\u6570\u91cf / \u5e02\u5834",ko:"\uc218\ub7c9 / \uc2dc\uc7a5"},
    "Quantity / Market / Delivery Target":{es:"Cantidad / mercado / entrega",fr:"Quantite / marche / livraison",ru:"\u041a\u043e\u043b-\u0432\u043e / \u0440\u044b\u043d\u043e\u043a / \u0441\u0440\u043e\u043a",ja:"\u6570\u91cf / \u5e02\u5834 / \u7d0d\u671f",ko:"\uc218\ub7c9 / \uc2dc\uc7a5 / \ub0a9\uae30"},
    "Requirement / Color / Delivery Target":{es:"Requisito / color / entrega",fr:"Besoin / couleur / livraison",ru:"\u0422\u0440\u0435\u0431\u043e\u0432\u0430\u043d\u0438\u0435 / \u0446\u0432\u0435\u0442 / \u0441\u0440\u043e\u043a",ja:"\u8981\u671b / \u8272 / \u7d0d\u671f",ko:"\uc694\uad6c / \uc0c9\uc0c1 / \ub0a9\uae30"},
    "Get Quote":{es:"Cotizar",fr:"Demander un prix",ru:"\u0417\u0430\u043f\u0440\u043e\u0441\u0438\u0442\u044c \u0446\u0435\u043d\u0443",ja:"\u898b\u7a4d\u3082\u308a",ko:"\uacac\uc801 \ubb38\uc758"},
    "Request a quotation":{es:"Solicitar cotizacion",fr:"Demander un devis",ru:"\u0417\u0430\u043f\u0440\u043e\u0441 \u0446\u0435\u043d\u044b",ja:"\u898b\u7a4d\u3082\u308a\u4f9d\u983c",ko:"\uacac\uc801 \uc694\uccad"},
    "Your message opens in WhatsApp first, so you can review it before sending.":{es:"El mensaje se abre primero en WhatsApp para que pueda revisarlo antes de enviarlo.",fr:"Le message s'ouvre d'abord dans WhatsApp afin que vous puissiez le verifier avant l'envoi.",ru:"\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u043e\u0442\u043a\u0440\u043e\u0435\u0442\u0441\u044f \u0432 WhatsApp, \u0432\u044b \u0441\u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0435\u0433\u043e \u043f\u0435\u0440\u0435\u0434 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u043e\u0439.",ja:"\u30e1\u30c3\u30bb\u30fc\u30b8\u306f\u5148\u306bWhatsApp\u3067\u958b\u304d\u3001\u9001\u4fe1\u524d\u306b\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002",ko:"\uba54\uc2dc\uc9c0\ub294 WhatsApp\uc5d0\uc11c \uba3c\uc800 \uc5f4\ub9ac\uba70, \uc804\uc1a1 \uc804 \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."},
    "Champagne Ivory 120gsm Mikado Satin Fabric":{es:"Tela satin mikado marfil champan 120gsm",fr:"Tissu satin mikado ivoire champagne 120gsm",ru:"\u0422\u043a\u0430\u043d\u044c \u043c\u0438\u043a\u0430\u0434\u043e \u0441\u0430\u0442\u0438\u043d 120gsm \u0448\u0430\u043c\u043f\u0430\u043d\u044c \u0430\u0439\u0432\u043e\u0440\u0438",ja:"120gsm \u30b7\u30e3\u30f3\u30d1\u30f3\u30a2\u30a4\u30dc\u30ea\u30fc \u30df\u30ab\u30c9\u30b5\u30c6\u30f3\u751f\u5730",ko:"120gsm \uc0f4\ud398\uc778 \uc544\uc774\ubcf4\ub9ac \ubbf8\uce74\ub3c4 \uc0c8\ud2f4 \uc6d0\ub2e8"},
    "YX690 MIKADO SATIN FABRIC":{es:"YX690 TELA SATIN MIKADO",fr:"YX690 TISSU SATIN MIKADO",ru:"YX690 \u041c\u0418\u041a\u0410\u0414\u041e \u0421\u0410\u0422\u0418\u041d",ja:"YX690 \u30df\u30ab\u30c9\u30b5\u30c6\u30f3\u751f\u5730",ko:"YX690 \ubbf8\uce74\ub3c4 \uc0c8\ud2f4 \uc6d0\ub2e8"}
  };

  var phraseMap={
    es:[
      ["Champagne Ivory","marfil champan"],["champagne ivory","marfil champan"],["Mikado Satin Fabric","tela satin mikado"],["mikado satin fabric","tela satin mikado"],["Mikado Satin","satin mikado"],["satin fabric","tela satin"],["Satin Fabric","Tela satin"],["Bridal Dresses","vestidos de novia"],["bridal dresses","vestidos de novia"],["Wedding Gowns","vestidos de boda"],["wedding gowns","vestidos de boda"],["party dresses","vestidos de fiesta"],["Party Dresses","vestidos de fiesta"],["skirts","faldas"],["Skirts","faldas"],["Wholesale","Mayorista"],["wholesale","mayorista"],["fabric manufacturer","fabricante de telas"],["Fabric Manufacturer","Fabricante de telas"],["buyer questions","preguntas de compradores"],["Buyer questions","Preguntas de compradores"],["Request a","Solicitar una"],["quotation","cotizacion"],["Quote","Cotizacion"],["MOQ","MOQ"],["delivery","entrega"],["Delivery","Entrega"],["width","ancho"],["Width","Ancho"],["weight","peso"],["Weight","Peso"],["color","color"],["Color","Color"],["price","precio"],["Price","Precio"],["lead time","plazo"],["Lead time","Plazo"],["fabric","tela"],["Fabric","Tela"]
    ],
    fr:[
      ["Champagne Ivory","ivoire champagne"],["champagne ivory","ivoire champagne"],["Mikado Satin Fabric","tissu satin mikado"],["mikado satin fabric","tissu satin mikado"],["Mikado Satin","satin mikado"],["satin fabric","tissu satin"],["Satin Fabric","Tissu satin"],["Bridal Dresses","robes de mariee"],["bridal dresses","robes de mariee"],["Wedding Gowns","robes de mariage"],["wedding gowns","robes de mariage"],["party dresses","robes de soiree"],["Party Dresses","robes de soiree"],["skirts","jupes"],["Skirts","jupes"],["Wholesale","Grossiste"],["wholesale","grossiste"],["fabric manufacturer","fabricant de tissus"],["Fabric Manufacturer","Fabricant de tissus"],["buyer questions","questions acheteurs"],["Buyer questions","Questions acheteurs"],["Request a","Demander un"],["quotation","devis"],["Quote","Devis"],["delivery","livraison"],["Delivery","Livraison"],["width","largeur"],["Width","Largeur"],["weight","poids"],["Weight","Poids"],["color","couleur"],["Color","Couleur"],["price","prix"],["Price","Prix"],["lead time","delai"],["Lead time","Delai"],["fabric","tissu"],["Fabric","Tissu"]
    ],
    ru:[
      ["Champagne Ivory","\u0448\u0430\u043c\u043f\u0430\u043d\u044c \u0430\u0439\u0432\u043e\u0440\u0438"],["champagne ivory","\u0448\u0430\u043c\u043f\u0430\u043d\u044c \u0430\u0439\u0432\u043e\u0440\u0438"],["Mikado Satin Fabric","\u0442\u043a\u0430\u043d\u044c \u043c\u0438\u043a\u0430\u0434\u043e \u0441\u0430\u0442\u0438\u043d"],["mikado satin fabric","\u0442\u043a\u0430\u043d\u044c \u043c\u0438\u043a\u0430\u0434\u043e \u0441\u0430\u0442\u0438\u043d"],["Mikado Satin","\u043c\u0438\u043a\u0430\u0434\u043e \u0441\u0430\u0442\u0438\u043d"],["Satin Fabric","\u0421\u0430\u0442\u0438\u043d\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c"],["satin fabric","\u0441\u0430\u0442\u0438\u043d\u043e\u0432\u0430\u044f \u0442\u043a\u0430\u043d\u044c"],["Bridal Dresses","\u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u044c\u044f"],["bridal dresses","\u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u044c\u044f"],["Wedding Gowns","\u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u044c\u044f"],["wedding gowns","\u0441\u0432\u0430\u0434\u0435\u0431\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u044c\u044f"],["party dresses","\u0432\u0435\u0447\u0435\u0440\u043d\u0438\u0435 \u043f\u043b\u0430\u0442\u044c\u044f"],["skirts","\u044e\u0431\u043a\u0438"],["Wholesale","\u041e\u043f\u0442"],["wholesale","\u043e\u043f\u0442"],["fabric manufacturer","\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c \u0442\u043a\u0430\u043d\u0435\u0439"],["quotation","\u043a\u043e\u0442\u0438\u0440\u043e\u0432\u043a\u0430"],["delivery","\u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430"],["Delivery","\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430"],["width","\u0448\u0438\u0440\u0438\u043d\u0430"],["Width","\u0428\u0438\u0440\u0438\u043d\u0430"],["weight","\u0432\u0435\u0441"],["Weight","\u0412\u0435\u0441"],["color","\u0446\u0432\u0435\u0442"],["Color","\u0426\u0432\u0435\u0442"],["price","\u0446\u0435\u043d\u0430"],["Price","\u0426\u0435\u043d\u0430"],["fabric","\u0442\u043a\u0430\u043d\u044c"],["Fabric","\u0422\u043a\u0430\u043d\u044c"]
    ],
    ja:[
      ["Champagne Ivory","\u30b7\u30e3\u30f3\u30d1\u30f3\u30a2\u30a4\u30dc\u30ea\u30fc"],["champagne ivory","\u30b7\u30e3\u30f3\u30d1\u30f3\u30a2\u30a4\u30dc\u30ea\u30fc"],["Mikado Satin Fabric","\u30df\u30ab\u30c9\u30b5\u30c6\u30f3\u751f\u5730"],["mikado satin fabric","\u30df\u30ab\u30c9\u30b5\u30c6\u30f3\u751f\u5730"],["Mikado Satin","\u30df\u30ab\u30c9\u30b5\u30c6\u30f3"],["Satin Fabric","\u30b5\u30c6\u30f3\u751f\u5730"],["satin fabric","\u30b5\u30c6\u30f3\u751f\u5730"],["Bridal Dresses","\u30d6\u30e9\u30a4\u30c0\u30eb\u30c9\u30ec\u30b9"],["bridal dresses","\u30d6\u30e9\u30a4\u30c0\u30eb\u30c9\u30ec\u30b9"],["Wedding Gowns","\u30a6\u30a7\u30c7\u30a3\u30f3\u30b0\u30c9\u30ec\u30b9"],["wedding gowns","\u30a6\u30a7\u30c7\u30a3\u30f3\u30b0\u30c9\u30ec\u30b9"],["party dresses","\u30d1\u30fc\u30c6\u30a3\u30fc\u30c9\u30ec\u30b9"],["skirts","\u30b9\u30ab\u30fc\u30c8"],["Wholesale","\u5378\u58f2"],["wholesale","\u5378\u58f2"],["fabric manufacturer","\u751f\u5730\u30e1\u30fc\u30ab\u30fc"],["quotation","\u898b\u7a4d\u3082\u308a"],["delivery","\u7d0d\u671f"],["Delivery","\u7d0d\u671f"],["width","\u5e45"],["Width","\u5e45"],["weight","\u91cd\u91cf"],["Weight","\u91cd\u91cf"],["color","\u8272"],["Color","\u8272"],["price","\u4fa1\u683c"],["Price","\u4fa1\u683c"],["fabric","\u751f\u5730"],["Fabric","\u751f\u5730"]
    ],
    ko:[
      ["Champagne Ivory","\uc0f4\ud398\uc778 \uc544\uc774\ubcf4\ub9ac"],["champagne ivory","\uc0f4\ud398\uc778 \uc544\uc774\ubcf4\ub9ac"],["Mikado Satin Fabric","\ubbf8\uce74\ub3c4 \uc0c8\ud2f4 \uc6d0\ub2e8"],["mikado satin fabric","\ubbf8\uce74\ub3c4 \uc0c8\ud2f4 \uc6d0\ub2e8"],["Mikado Satin","\ubbf8\uce74\ub3c4 \uc0c8\ud2f4"],["Satin Fabric","\uc0c8\ud2f4 \uc6d0\ub2e8"],["satin fabric","\uc0c8\ud2f4 \uc6d0\ub2e8"],["Bridal Dresses","\ube0c\ub77c\uc774\ub2ec \ub4dc\ub808\uc2a4"],["bridal dresses","\ube0c\ub77c\uc774\ub2ec \ub4dc\ub808\uc2a4"],["Wedding Gowns","\uc6e8\ub529 \ub4dc\ub808\uc2a4"],["wedding gowns","\uc6e8\ub529 \ub4dc\ub808\uc2a4"],["party dresses","\ud30c\ud2f0 \ub4dc\ub808\uc2a4"],["skirts","\uc2a4\ucee4\ud2b8"],["Wholesale","\ub3c4\ub9e4"],["wholesale","\ub3c4\ub9e4"],["fabric manufacturer","\uc6d0\ub2e8 \uc81c\uc870\uc0ac"],["quotation","\uacac\uc801"],["delivery","\ub0a9\uae30"],["Delivery","\ub0a9\uae30"],["width","\ud3ed"],["Width","\ud3ed"],["weight","\uc911\ub7c9"],["Weight","\uc911\ub7c9"],["color","\uc0c9\uc0c1"],["Color","\uc0c9\uc0c1"],["price","\uac00\uaca9"],["Price","\uac00\uaca9"],["fabric","\uc6d0\ub2e8"],["Fabric","\uc6d0\ub2e8"]
    ]
  };

  var placeholders={
    "Search fabrics":commonExact["Search fabrics"],
    "Email or WhatsApp number":{es:"Email o numero de WhatsApp",fr:"Email ou numero WhatsApp",ru:"Email \u0438\u043b\u0438 WhatsApp",ja:"Email\u307e\u305f\u306fWhatsApp\u756a\u53f7",ko:"Email \ub610\ub294 WhatsApp \ubc88\ud638"},
    "e.g. 500yd / USA / delivery date":{es:"ej. 500yd / EE.UU. / fecha de entrega",fr:"ex. 500yd / USA / date de livraison",ru:"\u043d\u0430\u043f\u0440. 500yd / USA / \u0434\u0430\u0442\u0430",ja:"\u4f8b: 500yd / USA / \u7d0d\u671f",ko:"\uc608: 500yd / USA / \ub0a9\uae30"},
    "Fabric use, target color, packing or sample request":{es:"Uso, color objetivo, empaque o muestra",fr:"Usage, couleur cible, emballage ou echantillon",ru:"\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435, \u0446\u0432\u0435\u0442, \u0443\u043f\u0430\u043a\u043e\u0432\u043a\u0430 \u0438\u043b\u0438 \u043e\u0431\u0440\u0430\u0437\u0435\u0446",ja:"\u7528\u9014\u3001\u76ee\u6a19\u8272\u3001\u5305\u88c5\u3001\u30b5\u30f3\u30d7\u30eb\u8981\u671b",ko:"\uc6a9\ub3c4, \ubaa9\ud45c \uc0c9\uc0c1, \ud3ec\uc7a5 \ub610\ub294 \uc0d8\ud50c \uc694\uccad"}
  };

  function getStoredLanguage(){
    try{return window.localStorage.getItem(storageKey)}catch(e){return null}
  }
  function setStoredLanguage(code){
    try{window.localStorage.setItem(storageKey,code)}catch(e){}
  }
  function getRequestedLanguage(){
    try{return new URLSearchParams(window.location.search).get("lang")}catch(e){return null}
  }
  function optionHtml(code){
    var item=languages[code];
    return '<button class="language-option" type="button" role="menuitemradio" aria-checked="false" data-lang-option="'+code+'"><span class="language-name"><span class="language-flag" aria-hidden="true"><img src="'+flagBase+item.flag+'" alt=""></span><span>'+item.label+'</span></span><small>'+item.short+'</small></button>';
  }
  function switcherHtml(){
    var menuId="languageMenu-"+pageId;
    return '<div class="language-switcher" data-language-switcher><button class="language-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="'+menuId+'" aria-label="Choose language"><span class="language-mark" aria-hidden="true"><img src="'+flagBase+'us.svg" alt=""></span><span data-language-current>EN</span></button><div class="language-menu" id="'+menuId+'" role="menu" aria-label="Choose language">'+order.map(optionHtml).join("")+'</div></div>';
  }
  function ensureSwitcher(){
    var existing=document.querySelector("[data-language-switcher]");
    if(existing){return existing}
    var search=document.querySelector(".nav > .site-search");
    if(!search){return null}
    var tools=document.createElement("div");
    tools.className="nav-tools";
    search.parentNode.insertBefore(tools,search);
    tools.appendChild(search);
    tools.insertAdjacentHTML("beforeend",switcherHtml());
    return tools.querySelector("[data-language-switcher]");
  }
  function closeSwitcher(switcher){
    switcher.classList.remove("is-open");
    var trigger=switcher.querySelector(".language-trigger");
    if(trigger){trigger.setAttribute("aria-expanded","false")}
  }
  function lookup(map,text,code){
    return map[text]&&map[text][code]?map[text][code]:null;
  }
  function translateText(text,code){
    if(code==="en"){return text}
    var leading=(text.match(/^\s*/)||[""])[0];
    var trailing=(text.match(/\s*$/)||[""])[0];
    var core=text.trim();
    if(!core){return text}
    var exact=lookup(commonExact,core,code);
    if(exact){return leading+exact+trailing}
    var result=core;
    (phraseMap[code]||[]).forEach(function(pair){
      result=result.split(pair[0]).join(pair[1]);
    });
    return leading+result+trailing;
  }
  function skipElement(el){
    if(!el){return true}
    if(el.closest&&el.closest(".language-switcher")){return true}
    var tag=el.tagName;
    return tag==="SCRIPT"||tag==="STYLE"||tag==="NOSCRIPT"||tag==="SVG"||tag==="CANVAS";
  }
  function translateVisibleText(code){
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(node){
        if(skipElement(node.parentElement)){return NodeFilter.FILTER_REJECT}
        if(!node.nodeValue.trim()){return NodeFilter.FILTER_REJECT}
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes=[];
    while(walker.nextNode()){nodes.push(walker.currentNode)}
    nodes.forEach(function(node){
      if(!node.__yxOriginalText){node.__yxOriginalText=node.nodeValue}
      node.nodeValue=translateText(node.__yxOriginalText,code);
    });
  }
  function translateAttributes(code){
    document.querySelectorAll("[placeholder]").forEach(function(el){
      if(!el.getAttribute("data-yx-original-placeholder")){el.setAttribute("data-yx-original-placeholder",el.getAttribute("placeholder"))}
      var original=el.getAttribute("data-yx-original-placeholder");
      el.setAttribute("placeholder",lookup(placeholders,original,code)||translateText(original,code));
    });
    document.querySelectorAll("[aria-label]").forEach(function(el){
      if(el.closest&&el.closest(".language-switcher")){return}
      if(!el.getAttribute("data-yx-original-aria")){el.setAttribute("data-yx-original-aria",el.getAttribute("aria-label"))}
      var original=el.getAttribute("data-yx-original-aria");
      el.setAttribute("aria-label",translateText(original,code));
    });
    document.title=translateText(originalTitle,code);
  }
  function applyLanguage(code,store){
    if(!languages[code]){code="en"}
    var item=languages[code];
    document.documentElement.setAttribute("lang",item.html);
    document.querySelectorAll("[data-language-current]").forEach(function(el){el.textContent=item.short});
    document.querySelectorAll(".language-mark img").forEach(function(el){el.setAttribute("src",flagBase+item.flag);el.setAttribute("alt","")});
    document.querySelectorAll("[data-lang-option]").forEach(function(el){
      var active=el.getAttribute("data-lang-option")===code;
      el.classList.toggle("is-active",active);
      el.setAttribute("aria-checked",active?"true":"false");
    });
    translateVisibleText(code);
    translateAttributes(code);
    if(store){setStoredLanguage(code)}
  }
  function init(){
    var switcher=ensureSwitcher();
    if(!switcher){return}
    var trigger=switcher.querySelector(".language-trigger");
    if(trigger){
      trigger.addEventListener("click",function(){
        var open=!switcher.classList.contains("is-open");
        switcher.classList.toggle("is-open",open);
        trigger.setAttribute("aria-expanded",open?"true":"false");
      });
    }
    switcher.querySelectorAll("[data-lang-option]").forEach(function(option){
      option.addEventListener("click",function(){
        applyLanguage(option.getAttribute("data-lang-option"),true);
        closeSwitcher(switcher);
      });
    });
    document.addEventListener("click",function(event){
      if(!switcher.contains(event.target)){closeSwitcher(switcher)}
    });
    document.addEventListener("keydown",function(event){
      if(event.key==="Escape"){closeSwitcher(switcher)}
    });
    var initial=getRequestedLanguage()||getStoredLanguage()||"en";
    applyLanguage(languages[initial]?initial:"en",false);
  }
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}
})();
