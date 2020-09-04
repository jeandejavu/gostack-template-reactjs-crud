import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data } = await api.get<IFoodPlate[]>('foods');
      setFoods(data);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const { data } = await api.post<IFoodPlate>('foods', {
          ...food,
          available: true,
        });
        setFoods(foodsState => [...foodsState, data]);
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const handleSetAvailableFood = useCallback(async (food: IFoodPlate): Promise<
    void
  > => {
    // await api.patch(`foods/${food.id}`, { available: food.available });
    await api.put(`foods/${food.id}`, food);
    setFoods(foodsState =>
      foodsState.map(foodState => {
        if (foodState.id !== food.id) return foodState;
        return { ...foodState, available: food.available };
      }),
    );
  }, []);

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      const foodUpdate = {
        ...editingFood,
        ...food,
      };

      await api.put(`foods/${editingFood.id}`, foodUpdate);

      setFoods(foodsState =>
        foodsState.map(foodState => {
          if (foodState.id !== foodUpdate.id) return foodState;
          return foodUpdate;
        }),
      );
    },
    [editingFood],
  );

  const handleDeleteFood = useCallback(async (id: number): Promise<void> => {
    await api.delete(`foods/${id}`);
    setFoods(foodsState => foodsState.filter(food => food.id !== id));
  }, []);

  const toggleModal = useCallback((): void => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback((): void => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback(
    (food: IFoodPlate): void => {
      setEditingFood(food);
      setEditModalOpen(!editModalOpen);
    },
    [editModalOpen],
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleSetAvailableFood={handleSetAvailableFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
