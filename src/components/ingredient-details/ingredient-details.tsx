import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';

import { useSelector } from '../../services/store';
import { selectIngredients } from '../../features/ingredientsSlice';
import { useParams, useNavigate } from 'react-router-dom';

export const IngredientDetails: FC = () => {
  /** TODO: взять переменную из стора */
  const navigate = useNavigate();
  const ingredients = useSelector(selectIngredients);
  const { id } = useParams<{ id: string }>();

  function getIngredient(idIngredient: string | undefined) {
    if (!idIngredient) return navigate('/');
    const ingredientDataArray = ingredients.filter(
      (ingredient) => ingredient._id === idIngredient
    );
    return ingredientDataArray[0];
  }
  const ingredientData = getIngredient(id);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
