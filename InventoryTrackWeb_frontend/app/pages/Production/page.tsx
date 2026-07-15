"use client";

import { useState, useEffect } from 'react';
import { Factory, Plus, Play, CheckCircle, Trash2, BookOpen } from 'lucide-react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { fetchInventoryMaterials, InventoryMaterial } from '@/lib/api/material';
import { triggerDashboardRefresh } from '@/lib/utils/dashboardRefresh';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  createRecipeAction, 
  getRecipesAction, 
  deleteRecipeAction,
  createProductionAction,
  getProductionsAction,
  completeProductionAction,
  deleteProductionAction
} from '@/lib/actions/production_actions';

interface Recipe {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  sellingPrice?: number;
  ingredients: Array<{
    materialId: string;
    materialName?: string;
    quantity: number;
  }>;
}

interface ProductionBatch {
  id?: string;
  _id?: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  estimatedOutput: number;
  actualOutput?: number;
  status: 'ongoing' | 'completed';
  wastage?: number;
  createdAt?: string;
  completedAt?: string;
}

const Production = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [actualOutput, setActualOutput] = useState('');

  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    price: '',
    ingredients: [] as { materialId: string; quantity: string }[],
  });

  const [batchForm, setBatchForm] = useState({
    recipeId: '',
    quantity: '',
    estimatedOutput: '',
  });

  // Load recipes and batches on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recipesRes, batchesRes, inventory] = await Promise.all([
        getRecipesAction(),
        getProductionsAction(),
        fetchInventoryMaterials(),
      ]);

      if (recipesRes.success) {
        const mappedRecipes: Recipe[] = (recipesRes.data || []).map((recipe: any) => ({
          id: recipe._id,
          _id: recipe._id,
          name: recipe.name,
          description: recipe.description,
          price: recipe.selling_price || 0,
          sellingPrice: recipe.selling_price || 0,
          ingredients: (recipe.ingredients || []).map((ing: any) => ({
            materialId: ing.material?._id || ing.material,
            materialName: ing.material?.name || ing.name,
            quantity: ing.quantity,
          })),
        }));
        setRecipes(mappedRecipes);
      }
      if (batchesRes.success) {
        const mappedBatches: ProductionBatch[] = (batchesRes.data || []).map((batch: any) => ({
          id: batch._id,
          _id: batch._id,
          recipeId: batch.recipe?._id || batch.recipe,
          recipeName: batch.recipe?.name || 'Unknown Recipe',
          quantity: batch.batchQuantity || 0,
          estimatedOutput: batch.estimatedOutput || 0,
          actualOutput: batch.actualOutput,
          status: batch.status,
          wastage: batch.wastage || 0,
          createdAt: batch.created_at,
          completedAt: batch.updated_at,
        }));
        setBatches(mappedBatches);
      }
      setMaterials(inventory);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes and batches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    setRecipeForm({
      ...recipeForm,
      ingredients: [...recipeForm.ingredients, { materialId: '', quantity: '' }],
    });
  };

  const updateIngredient = (index: number, field: 'materialId' | 'quantity', value: string) => {
    const newIngredients = [...recipeForm.ingredients];
    newIngredients[index][field] = value;
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    setRecipeForm({
      ...recipeForm,
      ingredients: recipeForm.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeForm.name || !recipeForm.price || recipeForm.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one ingredient",
        variant: "destructive",
      });
      return;
    }

    const validIngredients = recipeForm.ingredients.filter(i => i.materialId && i.quantity);
    if (validIngredients.length === 0) {
      toast({
        title: "Error",
        description: "Please add valid ingredients",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingRecipe(true);
    try {
      const result = await createRecipeAction({
        name: recipeForm.name,
        description: recipeForm.description,
        selling_price: parseFloat(recipeForm.price),
        ingredients: validIngredients.map(i => {
          const selected = materials.find((m) => m.id === i.materialId);
          return {
            name: selected?.name || 'Material',
            material: i.materialId,
            quantity: parseFloat(i.quantity),
          };
        }),
      });

      if (result.success) {
        toast({ title: "Success", description: "Recipe created successfully" });
        setRecipeForm({ name: '', description: '', price: '', ingredients: [] });
        setIsRecipeOpen(false);
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create recipe",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: "Error",
        description: "Failed to create recipe",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRecipe(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchForm.recipeId || !batchForm.quantity || !batchForm.estimatedOutput) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const batchQuantity = parseFloat(batchForm.quantity);
    if (Number.isNaN(batchQuantity) || batchQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Batch quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const recipe = recipes.find(r => (r.id || r._id) === batchForm.recipeId);
    if (!recipe) {
      toast({
        title: "Error",
        description: "Recipe not found",
        variant: "destructive",
      });
      return;
    }

    // Check if we have enough materials before creating the batch
    const shortages = recipe.ingredients
      .map((ing) => {
        const material = materials.find((m) => m.id === ing.materialId);
        const available = material?.quantity || 0;
        const needed = ing.quantity * batchQuantity;
        return {
          materialName: ing.materialName || material?.name || 'Material',
          needed,
          available,
          insufficient: available < needed,
        };
      })
      .filter((item) => item.insufficient);

    if (shortages.length > 0) {
      const first = shortages[0];
      toast({
        title: "Insufficient Materials",
        description: `Cannot start production. ${first.materialName}: need ${first.needed}, available ${first.available}`,
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBatch(true);
    try {
      const result = await createProductionAction({
        recipeId: batchForm.recipeId,
        quantity: batchQuantity,
        estimatedOutput: parseFloat(batchForm.estimatedOutput),
      });

      if (result.success) {
        toast({ title: "Success", description: "Production batch started" });
        setBatchForm({ recipeId: '', quantity: '', estimatedOutput: '' });
        setIsBatchOpen(false);
        await loadData();
        triggerDashboardRefresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start production",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to start production",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleCompleteBatch = async () => {
    if (!selectedBatch || !actualOutput) return;
    
    try {
      const batchId = selectedBatch.id || selectedBatch._id || '';
      const result = await completeProductionAction(batchId, parseFloat(actualOutput));

      if (result.success) {
        toast({ title: "Success", description: "Batch completed successfully" });
        setSelectedBatch(null);
        setActualOutput('');
        setIsCompleteOpen(false);
        await loadData();
        triggerDashboardRefresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to complete batch",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error completing batch:', error);
      toast({
        title: "Error",
        description: "Failed to complete batch",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const result = await deleteRecipeAction(recipeId);

      if (result.success) {
        toast({ title: "Deleted", description: "Recipe removed" });
        await loadData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete recipe",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Production" subtitle="Manage recipes and production batches">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="batches" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="batches">Production Batches</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <Dialog open={isRecipeOpen} onOpenChange={setIsRecipeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  New Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">📖 Create Recipe</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRecipeSubmit} className="space-y-6 mt-6">
                  {/* Recipe Name */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                      Recipe Name
                    </label>
                    <Input
                      placeholder="e.g., 1-Tier Cake"
                      value={recipeForm.name}
                      onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                      Description
                    </label>
                    <Input
                      placeholder="Brief description of the recipe"
                      value={recipeForm.description}
                      onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                      Selling Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 25.00"
                      value={recipeForm.price}
                      onChange={(e) => setRecipeForm({ ...recipeForm, price: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  
                  {/* Ingredients */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
                        Ingredients
                      </label>
                      <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recipeForm.ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 items-center p-3 bg-muted/50 rounded-lg border border-border">
                          <Select
                            value={ing.materialId}
                            onValueChange={(v) => updateIngredient(index, 'materialId', v)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border border-border">
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="w-24"
                            value={ing.quantity}
                            onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-destructive hover:bg-destructive/10"
                            onClick={() => removeIngredient(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRecipeOpen(false)} disabled={isCreatingRecipe}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="gradient" className="flex-1" disabled={isCreatingRecipe}>
                      {isCreatingRecipe ? 'Creating...' : 'Create Recipe'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isBatchOpen} onOpenChange={setIsBatchOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Play className="h-4 w-4 mr-2" />
                  Start Production
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">🏭 Start Production Batch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBatchSubmit} className="space-y-6 mt-6">
                  {/* Recipe Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                      Select Recipe
                    </label>
                    <Select
                      value={batchForm.recipeId}
                      onValueChange={(v) => setBatchForm({ ...batchForm, recipeId: v })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choose a recipe" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border">
                        {recipes
                          .map((r) => ({ ...r, optionId: r.id || r._id }))
                          .filter((r): r is Recipe & { optionId: string } => Boolean(r.optionId))
                          .map((r) => (
                            <SelectItem key={r.optionId} value={r.optionId}>{r.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                      Quantity to Produce
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={batchForm.quantity}
                      onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  {/* Estimated Output */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                      Estimated Output
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={batchForm.estimatedOutput}
                      onChange={(e) => setBatchForm({ ...batchForm, estimatedOutput: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsBatchOpen(false)} disabled={isCreatingBatch}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="gradient" className="flex-1" disabled={isCreatingBatch}>
                      {isCreatingBatch ? 'Starting...' : 'Start Production'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="batches" className="space-y-6">
          {/* Ongoing Batches */}
          <div>
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Factory className="h-5 w-5 text-warning" />
              Ongoing Production ({batches.filter(b => b.status === 'ongoing').length})
            </h2>
            {batches.filter(b => b.status === 'ongoing').length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No ongoing production batches</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.filter(b => b.status === 'ongoing').map((batch) => (
                  <Card key={batch.id || batch._id} className="p-5 border-warning/30 bg-warning/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning/20 text-warning">
                        In Progress
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{batch.recipeName}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground mb-4">
                      <p>Quantity: <span className="text-foreground font-medium">{batch.quantity}</span></p>
                      <p>Est. Output: <span className="text-foreground font-medium">{batch.estimatedOutput}</span></p>
                    </div>
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => {
                        setSelectedBatch(batch);
                        setIsCompleteOpen(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Batch
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed Batches */}
          <div>
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Completed ({batches.filter(b => b.status === 'completed').length})
            </h2>
            {batches.filter(b => b.status === 'completed').length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No completed batches yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                {batches.filter(b => b.status === 'completed').slice().reverse().slice(0, 6).map((batch) => (
                  <Card key={batch.id || batch._id} className="p-5">
                    <div className="flex items-center justify-between mb-3 ">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/20 text-success ">
                        Completed
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {batch.completedAt ? new Date(batch.completedAt).toLocaleDateString() : (batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'N/A')}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold mb-2">{batch.recipeName}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        Output: <span className="text-foreground font-medium">{batch.actualOutput || 0} / {batch.estimatedOutput}</span>
                      </p>
                      <p className={`font-medium ${(batch.wastage || 0) > 10 ? 'text-destructive' : 'text-success'}`}>
                        Wastage: {(batch.wastage || 0).toFixed(1)}%
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recipes">
          {recipes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No recipes yet</h3>
              <p className="text-muted-foreground mb-6">Create your first recipe to start production</p>
              <Button variant="gradient" onClick={() => setIsRecipeOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Recipe
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe, index) => (
                <Card 
                  key={recipe.id || recipe._id}
                  className="p-5 opacity-0 animate-scale-in border-b border-border"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3 ">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteRecipe(recipe.id || recipe._id || '')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">{recipe.name}</h3>
                  {recipe.description && (
                    <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                  )}
                  <p className="text-lg font-bold text-primary mb-3">${(recipe.price || recipe.sellingPrice || 0).toFixed(2)}</p>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map((ing) => (
                        <span key={ing.materialId} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {ing.materialName || ing.materialId} ({ing.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      )}

      {/* Complete Batch Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Complete Production Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Actual Output (units/weight)</label>
              <Input
                type="number"
                placeholder="Enter actual output"
                value={actualOutput}
                onChange={(e) => setActualOutput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be compared with estimated output to calculate wastage
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsCompleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="success" className="flex-1" onClick={handleCompleteBatch}>
                Complete Batch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Production;
