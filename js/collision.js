function collide(s1,s2){
	var hit = false;

	//calcula a insatancia entre o centro dos sprits
	var vetX = s1.centerX() - s2.centerX();
	var vetY = s1.centerY() - s2.centerY();

	//armazena as somas das metades dos sprites na largura e altura
	var sumHalfWidht = s1.halfWidht() + s2.halfWidht();
	var sumHalfHeight = s1.halfHeight() + s2.halfHeight();

	//verifica a colição
	if(Math.abs(vetX) < sumHalfWidht && Math.abs(vetY) < sumHalfHeight){
		hit = true;
	}

	return hit;
}